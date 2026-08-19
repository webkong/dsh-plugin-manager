// 业务层：插件清单与 安装/卸载/停用/启动。
// 清单以 Loader 实时行为主枚举（pluginInventory，含全部内置 150+ 插件行），
// 叠加 profile manifest 的 bundles/dependencies（已安装但未挂载 / 失效行）。
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { resolvePackageDirs, readPackageMetas } from './resolve.js'
import { findEntryIds } from './entryIds.js'
import { githubUrlFromSpec, githubUrlFromRepo, specSource } from './github.js'
import { patchHasStop, patchWithStop, patchWithoutStop, stopAddition } from './patch.js'

export function createManager(ctx, profile, fsTools) {
  const { readText, writeText, readManifest, updateManifest, execBash, profilePath, findDshPkgDir, dshHome } = fsTools
  const inventory = ctx.get('pluginInventory')
  const loader = ctx.get('loader')

  function shellQuote(s) {
    return "'" + String(s).replace(/'/g, "'\\''") + "'"
  }

  function tail(text, max) {
    if (!text) return ''
    return text.length > max ? '…' + text.slice(-max) : text
  }

  // 枚举安装锚点与共享目录中的 @deepseek-ai 包（存在但未挂载的内置插件）
  function enumerateAnchorPackages(installPkgDir) {
    const anchors = []
    if (installPkgDir) anchors.push(join(installPkgDir, 'node_modules', '@deepseek-ai'))
    anchors.push(join(dshHome(), 'profiles', 'node_modules', '@deepseek-ai'))
    const names = []
    const seen = new Set()
    for (const anchor of anchors) {
      let entries = []
      try {
        entries = readdirSync(anchor)
      } catch {
        continue
      }
      for (const e of entries) {
        const n = '@deepseek-ai/' + e
        if (!seen.has(n)) {
          seen.add(n)
          names.push(n)
        }
      }
    }
    return names
  }

  // Loader 根 include 前缀（entry.id 形如 "include:xxx"，补丁定位用去前缀后的行 id）
  function includePrefix() {
    if (!loader) return ''
    for (const entry of loader.entries()) {
      if (entry.options && entry.options.name === 'cordis:include') return `${entry.id}:`
    }
    return ''
  }

  function rowIdOf(entryId) {
    const prefix = includePrefix()
    if (prefix.length > 0 && entryId.startsWith(prefix)) return entryId.slice(prefix.length)
    return entryId
  }

  // 读取 Loader 实时行：按包名聚合（moduleName → 行 id 列表 / enabled / fiberPhase）
  function readInventoryRows() {
    const byName = new Map()
    try {
      const inv = inventory && typeof inventory.list === 'function' ? inventory.list() : null
      if (inv && Array.isArray(inv.entries)) {
        for (const e of inv.entries) {
          const nm = e.moduleName
          if (!nm) continue
          const rec = byName.get(nm) || { entryIds: [], enabled: true, fiberPhase: null }
          rec.entryIds.push(rowIdOf(e.entryId))
          if (!e.enabled) rec.enabled = false
          if (e.fiberPhase) rec.fiberPhase = e.fiberPhase
          byName.set(nm, rec)
        }
      }
    } catch { /* inventory optional */ }
    return byName
  }

  async function list() {
    const dir = profilePath(profile)
    const manifest = await readManifest(dir)
    if (!manifest) {
      return { ok: false, message: 'profile 目录不存在或 manifest 无法解析: ' + dir }
    }
    const patchText = await readText(dir + '/cordis.patch.yml')
    const bundles = Array.isArray(manifest.dsh && manifest.dsh.profile && manifest.dsh.profile.bundles)
      ? manifest.dsh.profile.bundles
      : []
    const deps = manifest.dependencies && typeof manifest.dependencies === 'object' ? manifest.dependencies : {}

    const inventoryRows = readInventoryRows()
    const installPkgDir = findDshPkgDir()

    // 枚举集合：loader 行 ∪ bundles ∪ dependencies ∪ 锚点内置包
    const names = []
    const seen = new Set()
    for (const n of inventoryRows.keys()) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of bundles) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of Object.keys(deps)) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of enumerateAnchorPackages(installPkgDir)) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }

    const dirs = resolvePackageDirs(names, dir, installPkgDir)
    const metas = readPackageMetas(dirs)

    const plugins = []
    for (const nm of names) {
      const pkgDir = dirs[nm]
      const meta = metas[nm]
      const spec = deps[nm] || null
      const inv = inventoryRows.get(nm)
      const installed = !!pkgDir
      const isBundle = !!(meta && meta.bundlePatch)
      const mounted = !!inv
      const disabledByManager = patchHasStop(patchText, nm)
      const disabled = disabledByManager || (inv ? !inv.enabled : false)
      const kind = Object.prototype.hasOwnProperty.call(deps, nm) ? 'third-party' : 'builtin'

      let entryIds = inv ? [...inv.entryIds] : []
      if (kind === 'third-party' && entryIds.length === 0 && meta && meta.bundlePatch && pkgDir) {
        const patchYaml = await readText(pkgDir + '/' + meta.bundlePatch)
        entryIds = findEntryIds(patchYaml, nm)
      }

      const ghFromSpec = githubUrlFromSpec(spec)
      const ghFromRepo = meta ? githubUrlFromRepo(meta.repository) : undefined
      let githubUrl = ghFromSpec || ghFromRepo
      if (!githubUrl && meta && meta.homepage && /github\.com/.test(meta.homepage)) {
        githubUrl = githubUrlFromRepo(meta.homepage)
      }

      plugins.push({
        name: nm,
        version: meta ? meta.version : null,
        description: meta ? meta.description : null,
        kind,
        source: specSource(spec),
        spec,
        installed,
        installDir: pkgDir || null,
        inBundles: bundles.indexOf(nm) !== -1,
        isBundle,
        mounted,
        disabled,
        disabledByManager,
        enabled: mounted && !disabled,
        missing: !installed,
        runtime: inv ? { enabled: inv.enabled, fiberPhase: inv.fiberPhase } : null,
        entryIds,
        githubUrl: githubUrl || null,
        homepage: meta ? meta.homepage : null,
      })
    }

    plugins.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'builtin' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return {
      ok: true,
      profile,
      profileDir: dir,
      dshHome: dir.slice(0, dir.length - ('/profiles/' + profile).length),
      counts: {
        total: plugins.length,
        builtin: plugins.filter((p) => p.kind === 'builtin').length,
        thirdParty: plugins.filter((p) => p.kind === 'third-party').length,
        disabled: plugins.filter((p) => p.disabled).length,
      },
      plugins,
    }
  }

  async function install(spec) {
    if (!spec || !String(spec).trim()) return { ok: false, message: '缺少插件标识' }
    const clean = String(spec).trim()
    const res = await execBash('dsh plugin --profile ' + profile + ' add ' + shellQuote(clean), 300000)
    const out = ((res.stdout || '') + '\n' + (res.stderr || '')).trim()
    if (res.exitCode === 0) {
      return {
        ok: true,
        message: '已安装 ' + clean + '（若声明了 dsh.bundle 已自动加入装载列表；重启后生效）',
        output: tail(out, 1500),
      }
    }
    return { ok: false, message: '安装失败（退出码 ' + res.exitCode + '）', output: tail(out, 2000) }
  }

  async function uninstall(name) {
    if (!name) return { ok: false, message: '缺少插件名' }
    const dir = profilePath(profile)
    const res = await execBash('dsh plugin --profile ' + profile + ' remove ' + shellQuote(name), 300000)
    const out = ((res.stdout || '') + '\n' + (res.stderr || '')).trim()
    if (res.exitCode !== 0) {
      return { ok: false, message: '卸载失败（退出码 ' + res.exitCode + '）', output: tail(out, 2000) }
    }
    // 清理可能残留的停用条目
    const patchText = await readText(dir + '/cordis.patch.yml')
    const cleaned = patchWithoutStop(patchText, name)
    if (cleaned !== patchText) await writeText(dir + '/cordis.patch.yml', cleaned)
    return { ok: true, message: '已卸载 ' + name + '（重启后不再装载）', output: tail(out, 1500) }
  }

  async function stop(name) {
    const dir = profilePath(profile)
    const listRes = await list()
    const plugin = listRes.plugins && listRes.plugins.find((p) => p.name === name)
    if (!plugin) return { ok: false, message: '未找到插件 ' + name }
    if (plugin.kind === 'builtin') return { ok: false, message: '内置插件不可停用（属于 DSH 发行版）' }
    if (!plugin.mounted) return { ok: false, message: name + ' 未在装载状态' }
    const patchText = await readText(dir + '/cordis.patch.yml')
    if (patchHasStop(patchText, name)) {
      return { ok: true, message: name + ' 已处于停用状态（重启后生效）' }
    }
    if (plugin.entryIds && plugin.entryIds.length) {
      const addition = stopAddition(name, plugin.entryIds)
      const next = patchWithStop(patchText, addition)
      const ok = await writeText(dir + '/cordis.patch.yml', next)
      return ok
        ? { ok: true, message: '已停用 ' + name + '（已写入 profile 的 cordis.patch.yml；重启后生效）' }
        : { ok: false, message: '写入 cordis.patch.yml 失败' }
    }
    // 兜底：从 bundles 列表移除（下次 dsh plugin 命令可能被 reconcile 加回）
    const mres = await updateManifest(dir, (m) => {
      const bundles = (m.dsh && m.dsh.profile && m.dsh.profile.bundles) || []
      m.dsh.profile.bundles = bundles.filter((b) => b !== name)
    })
    return {
      ok: mres.ok,
      message: mres.ok
        ? '已停用 ' + name + '（未能定位 patch 条目，改为从 bundles 列表移除；重启后生效）'
        : mres.message,
    }
  }

  async function start(name) {
    const dir = profilePath(profile)
    const listRes = await list()
    const plugin = listRes.plugins && listRes.plugins.find((p) => p.name === name)
    if (!plugin) return { ok: false, message: '未找到插件 ' + name }
    // 1) 移除停用 patch 条目
    const patchText = await readText(dir + '/cordis.patch.yml')
    let message = null
    if (patchHasStop(patchText, name)) {
      const cleaned = patchWithoutStop(patchText, name)
      const ok = await writeText(dir + '/cordis.patch.yml', cleaned)
      if (!ok) return { ok: false, message: '写入 cordis.patch.yml 失败' }
      message = '已启用 ' + name + '（已从 profile patch 移除停用条目；重启后生效）'
    }
    // 2) 若不在 bundles 且声明了 dsh.bundle，补回装载列表
    if (!plugin.inBundles && plugin.isBundle && plugin.installed) {
      const mres = await updateManifest(dir, (m) => {
        if (!m.dsh) m.dsh = {}
        if (!m.dsh.profile) m.dsh.profile = {}
        if (!Array.isArray(m.dsh.profile.bundles)) m.dsh.profile.bundles = []
        if (m.dsh.profile.bundles.indexOf(name) === -1) m.dsh.profile.bundles.push(name)
      })
      if (!mres.ok) return mres
      message = message || ('已加入装载列表：' + name + '（重启后生效）')
    }
    return { ok: true, message: message || (name + ' 未处于停用状态') }
  }

  return { list, install, uninstall, stop, start }
}

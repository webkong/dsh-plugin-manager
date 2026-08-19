// 业务层：插件清单与 安装/卸载/停用/启动。
// 依赖注入 fsTools（来自 fsutil.js），纯逻辑可测。
import { resolvePackageDirs, readPackageMetas } from './resolve.js'
import { findEntryIds } from './entryIds.js'
import { githubUrlFromSpec, githubUrlFromRepo, specSource } from './github.js'
import { patchHasStop, patchWithStop, patchWithoutStop, stopAddition } from './patch.js'

export function createManager(ctx, profile, fsTools) {
  const { readText, writeText, readManifest, updateManifest, execBash, profilePath, findDshPkgDir } = fsTools
  const inventory = ctx.get('pluginInventory')

  function shellQuote(s) {
    return "'" + String(s).replace(/'/g, "'\\''") + "'"
  }

  function tail(text, max) {
    if (!text) return ''
    return text.length > max ? '…' + text.slice(-max) : text
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

    let runtimeMap = {}
    try {
      if (inventory && typeof inventory.list === 'function') {
        const inv = inventory.list()
        if (inv && Array.isArray(inv.entries)) {
          for (const e of inv.entries) {
            runtimeMap[e.moduleName] = { entryId: e.entryId, enabled: !!e.enabled, fiberPhase: e.fiberPhase || null }
          }
        }
      }
    } catch (e) { /* inventory optional */ }

    const installPkgDir = findDshPkgDir()

    const names = []
    const seen = new Set()
    for (const n of bundles) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of Object.keys(deps)) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }

    const dirs = resolvePackageDirs(names, dir, installPkgDir)
    const metas = readPackageMetas(dirs)

    const plugins = []
    for (const nm of names) {
      const pkgDir = dirs[nm]
      const meta = metas[nm]
      const spec = deps[nm] || null
      const inBundles = bundles.indexOf(nm) !== -1
      const installed = !!pkgDir
      const isBundle = !!(meta && meta.bundlePatch)
      const runtime = runtimeMap[nm] || null
      const disabledByManager = patchHasStop(patchText, nm)
      const disabled = disabledByManager || (runtime ? runtime.enabled === false : false)
      const kind = installed && pkgDir.indexOf(dir) === 0 ? 'third-party' : 'builtin'

      let entryIds = []
      if (kind === 'third-party' && meta && meta.bundlePatch && pkgDir) {
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
        inBundles,
        isBundle,
        disabled,
        disabledByManager,
        enabled: inBundles && !disabled,
        missing: inBundles && !installed,
        runtime: runtime ? { enabled: runtime.enabled, fiberPhase: runtime.fiberPhase } : null,
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
    if (!plugin.inBundles) return { ok: false, message: name + ' 未在装载列表中' }
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

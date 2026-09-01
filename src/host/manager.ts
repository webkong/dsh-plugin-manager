// 业务层：插件清单与 安装/卸载/停用/启动。
// 清单以 Loader 实时行为主枚举（pluginInventory，含全部内置 150+ 插件行），
// 叠加 profile manifest 的 bundles/dependencies（已安装但未挂载 / 失效行）。
import { writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolvePackageDirs, readPackageMetas, type PackageMeta } from './resolve.ts'
import { findEntryIds } from './entryIds.ts'
import { githubUrlFromSpec, githubUrlFromRepo, specSource, loadGithubToken } from './github.ts'
import {
  patchHasStop, patchWithStop, patchWithoutStop, patchHasLoad, patchWithoutLoad,
  patchAppend, loadAddition, stopAddition,
} from './patch.ts'
import type { BashResult, MutateResult, PmgrSettings } from './fsutil.ts'

/** 文件工具集（handlers 从 fsutil 注入） */
export interface FsTools {
  readText(absPath: string): Promise<string>
  writeText(absPath: string, content: string): Promise<boolean>
  readManifest(dir: string): Promise<Record<string, unknown> | null>
  updateManifest(dir: string, mutate: (m: Record<string, unknown>) => void): Promise<MutateResult>
  execBash(command: string, timeoutMs?: number): Promise<BashResult>
  profilePath(profile: string): string
  findDshPkgDir(): string
  dshHome(): string
  readSettings(): Promise<PmgrSettings>
  writeSettings(s: PmgrSettings): Promise<PmgrSettings>
}

/** ctx 最小可用面 */
interface ManagerCtx {
  get(name: string): unknown
}

/** Loader 实时行（最小投影） */
interface LoaderEntry {
  id: string
  options?: { name?: string }
  disabled?: boolean
}
interface Loader {
  entries(): readonly LoaderEntry[]
}

/** pluginInventory 实时枚举（最小投影） */
interface InventoryEntry {
  moduleName?: string
  entryId: string
  enabled?: boolean
  fiberPhase?: string | null
}

/** agent preset 组合行（dsh ≥ 0.1.2 新增：预设组合装载的插件不在 Loader 根行里） */
interface PresetPluginRow {
  entryId?: string | null
  moduleName?: string
  /** true / false / 'conditional'（!!js 条件行，只有 Loader 上下文能定夺） */
  enabled?: boolean | 'conditional'
  condition?: string
  fiberPhase?: string | null
}

interface PresetPluginGroup {
  id?: string
  trust?: 'system' | 'user'
  name?: string
  isDefault?: boolean
  broken?: string
  rows?: readonly PresetPluginRow[]
}

/**
 * 快照形状：dsh < 0.1.2 的 list() 同步返回；dsh ≥ 0.1.2 改为 async（Promise），
 * 并新增 agentPresets。两种形态都用 await 统一处理。
 */
interface InventorySnapshot {
  entries?: readonly InventoryEntry[]
  agentPresets?: readonly PresetPluginGroup[]
}

interface PluginInventory {
  list(): InventorySnapshot | Promise<InventorySnapshot> | null
}

/** 插件清单行（wire 形状） */
export interface PluginView {
  name: string
  version: string | null
  description: string | null
  kind: 'builtin' | 'third-party'
  source: string
  spec: string | null
  installed: boolean
  installDir: string | null
  inBundles: boolean
  isBundle: boolean
  mounted: boolean
  disabled: boolean
  disabledByManager: boolean
  enabled: boolean
  missing: boolean
  runtime: { enabled: boolean; fiberPhase: string | null } | null
  entryIds: string[]
  /** 通过 agent preset 组合装载该包的预设 id（dsh ≥ 0.1.2；根 Loader 装载时为空） */
  presets: string[]
  githubUrl: string | null
  homepage: string | null
}

export interface ManagerResult {
  ok: boolean
  message: string
  output?: string
  restarting?: boolean
}

export function createManager(ctx: ManagerCtx, profile: string, fsTools: FsTools) {
  const { readText, writeText, readManifest, updateManifest, execBash, profilePath, findDshPkgDir, dshHome, readSettings, writeSettings } = fsTools

  // 懒解析：Host 服务异步激活，apply/构造阶段缓存到的可能是 undefined，
  // 之后所有请求都会静默退化为「空清单」。一律调用时经 ctx.get 取最新实例。
  const inventoryOf = (): PluginInventory | undefined => ctx.get('pluginInventory') as PluginInventory | undefined
  const loaderOf = (): Loader | undefined => ctx.get('loader') as Loader | undefined

  // 自动重启 dsh web：读取设置（默认关）；force=true 时无视设置强制重启
  async function scheduleRestart(force = false): Promise<boolean> {
    if (!force) {
      const settings = await readSettings()
      if (!settings.autoRestart) return false
    }
    try {
      const pid = process.pid
      const script = [
        '#!/bin/bash',
        'sleep 1',
        `kill ${pid} 2>/dev/null`,
        `for i in $(seq 1 30); do kill -0 ${pid} 2>/dev/null || break; sleep 1; done`,
        `kill -9 ${pid} 2>/dev/null`,
        'sleep 1',
        'nohup dsh web >> /tmp/dsh-web-auto-restart.log 2>&1 < /dev/null &',
        'sleep 5',
        'curl -s -o /dev/null http://127.0.0.1:3080',
        'echo "[$(date)] auto-restart completed" >> /tmp/dsh-web-auto-restart.log',
      ].join('\n')
      const scriptPath = join(tmpdir(), 'dsh-pmgr-restart-' + pid + '.sh')
      writeFileSync(scriptPath, script, 'utf8')
      const child = spawn('/bin/bash', [scriptPath], { detached: true, stdio: 'ignore' })
      child.unref()
      return true
    } catch (e) {
      console.log('dsh-plugin-manager: auto-restart failed', String(e))
      return false
    }
  }

  function shellQuote(s: string): string {
    return "'" + String(s).replace(/'/g, "'\\''") + "'"
  }

  function tail(text: string, max: number): string {
    if (!text) return ''
    return text.length > max ? '…' + text.slice(-max) : text
  }

  // Loader 根 include 前缀（entry.id 形如 "include:xxx"，补丁定位用去前缀后的行 id）
  function includePrefix(): string {
    const loader = loaderOf()
    if (!loader) return ''
    for (const entry of loader.entries()) {
      if (entry.options && entry.options.name === 'cordis:include') return `${entry.id}:`
    }
    return ''
  }

  function rowIdOf(entryId: string): string {
    const prefix = includePrefix()
    if (prefix.length > 0 && entryId.startsWith(prefix)) return entryId.slice(prefix.length)
    return entryId
  }

  interface InventoryRow {
    entryIds: string[]
    /** 有效启用：Loader 根行与 agent preset 组合行任一在用即为 true */
    enabled: boolean
    fiberPhase: string | null
    presets: string[]
  }

  /** 聚合中间态：两条轴（Loader 根行 / 预设组合行）各自记账，最后再合成 enabled */
  interface RowAccumulator {
    entryIds: string[]
    loaderEnabled: boolean | null
    presetEnabled: boolean | null
    fiberPhase: string | null
    presets: string[]
  }

  /**
   * 读取 Loader 实时行：按包名聚合（moduleName → 行 id 列表 / enabled / fiberPhase）。
   * dsh ≥ 0.1.2：list() 返回 Promise，且快照新增 agentPresets（预设组合装载的插件行）。
   * 这里统一 await（同步返回值 await 后原样透出），并把预设行并入同一张表：
   * 有的内置插件根行是 disabled、真正生效的是 agent preset 组合行，只看根行会误报「已停用」。
   */
  async function readInventoryRows(): Promise<Map<string, InventoryRow>> {
    const acc = new Map<string, RowAccumulator>()
    const inventory = inventoryOf()
    if (!inventory || typeof inventory.list !== 'function') return new Map()

    const rowOf = (name: string): RowAccumulator => {
      const existing = acc.get(name)
      if (existing) return existing
      const created: RowAccumulator = { entryIds: [], loaderEnabled: null, presetEnabled: null, fiberPhase: null, presets: [] }
      acc.set(name, created)
      return created
    }

    try {
      const snapshot = await inventory.list()
      if (!snapshot) return new Map()
      // ① Loader 根行
      if (Array.isArray(snapshot.entries)) {
        for (const e of snapshot.entries) {
          const nm = e.moduleName
          if (!nm) continue
          const rec = rowOf(nm)
          rec.entryIds.push(rowIdOf(e.entryId))
          rec.loaderEnabled = (rec.loaderEnabled ?? true) && e.enabled !== false
          if (e.fiberPhase) rec.fiberPhase = e.fiberPhase
        }
      }
      // ② agent preset 组合行（预设 id 记入 presets；组合行 id 不是 Loader 行 id，
      //    不能混入 entryIds，否则停用补丁会写到无法定位的条目上）
      if (Array.isArray(snapshot.agentPresets)) {
        for (const group of snapshot.agentPresets) {
          const presetId = typeof group.id === 'string' ? group.id : ''
          if (!presetId || !Array.isArray(group.rows)) continue
          for (const row of group.rows) {
            const nm = row.moduleName
            if (!nm) continue
            const rec = rowOf(nm)
            if (rec.presets.indexOf(presetId) === -1) rec.presets.push(presetId)
            // 'conditional' 表示 !!js 条件行，只有 Loader 上下文能定夺，按「在用」计
            if (row.enabled !== false) rec.presetEnabled = true
            else if (rec.presetEnabled === null) rec.presetEnabled = false
            if (row.fiberPhase && !rec.fiberPhase) rec.fiberPhase = row.fiberPhase
          }
        }
      }
    } catch { /* inventory optional */ }
    // 合成 enabled：任一轴在用即视为在用；两轴都没有信息时按在用处理（保持旧行为）
    const byName = new Map<string, InventoryRow>()
    for (const [name, rec] of acc) {
      const enabled = rec.loaderEnabled === true
        || rec.presetEnabled === true
        || (rec.loaderEnabled === null && rec.presetEnabled === null)
      byName.set(name, { entryIds: rec.entryIds, enabled, fiberPhase: rec.fiberPhase, presets: rec.presets })
    }
    return byName
  }

  async function list() {
    const dir = profilePath(profile)
    const manifest = await readManifest(dir)
    if (!manifest) {
      return { ok: false, message: 'profile 目录不存在或 manifest 无法解析: ' + dir }
    }
    const patchText = await readText(dir + '/cordis.patch.yml')
    const dsh = (manifest.dsh && typeof manifest.dsh === 'object' ? manifest.dsh : {}) as { profile?: { bundles?: unknown } }
    const profileObj = dsh.profile && typeof dsh.profile === 'object' ? dsh.profile : {}
    const bundles = Array.isArray(profileObj.bundles) ? profileObj.bundles.filter((b): b is string => typeof b === 'string') : []
    const deps = manifest.dependencies && typeof manifest.dependencies === 'object' ? manifest.dependencies as Record<string, unknown> : {}

    const inventoryRows = await readInventoryRows()
    const installPkgDir = findDshPkgDir()

    // 枚举集合：loader 行 ∪ bundles ∪ dependencies ∪ 锚点内置包
    const names: string[] = []
    const seen = new Set<string>()
    for (const n of inventoryRows.keys()) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of bundles) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of Object.keys(deps)) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }

    const dirs = resolvePackageDirs(names, dir, installPkgDir)
    const metas = readPackageMetas(dirs)

    const plugins: PluginView[] = []
    for (const nm of names) {
      const pkgDir = dirs[nm]
      const meta: PackageMeta | null = metas[nm]
      const spec = deps[nm] !== undefined && deps[nm] !== null ? String(deps[nm]) : null
      const inv = inventoryRows.get(nm)
      const installed = !!pkgDir
      const isBundle = !!(meta && meta.bundlePatch)
      const mounted = !!inv
      const disabledByManager = patchHasStop(patchText, nm)
      const disabled = disabledByManager || (inv ? !inv.enabled : false)
      const kind: 'builtin' | 'third-party' = Object.prototype.hasOwnProperty.call(deps, nm) ? 'third-party' : 'builtin'

      let entryIds: string[] = inv ? [...inv.entryIds] : []
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
        presets: inv ? [...inv.presets] : [],
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
      settings: await readSettings(),
      counts: {
        total: plugins.length,
        builtin: plugins.filter((p) => p.kind === 'builtin').length,
        thirdParty: plugins.filter((p) => p.kind === 'third-party').length,
        disabled: plugins.filter((p) => p.disabled).length,
      },
      plugins,
    }
  }

  async function install(spec: string): Promise<ManagerResult> {
    if (!spec || !String(spec).trim()) return { ok: false, message: '缺少插件标识' }
    const clean = String(spec).trim()
    const res = await execBash('dsh plugin --profile ' + profile + ' add ' + shellQuote(clean), 300000)
    const out = ((res.stdout || '') + '\n' + (res.stderr || '')).trim()
    if (res.exitCode === 0) {
      const restarted = await scheduleRestart()
      return {
        ok: true,
        message: restarted
          ? '已安装 ' + clean + '，正在自动重启 dsh web（约 10 秒后刷新页面生效）'
          : '已安装 ' + clean + '（若声明了 dsh.bundle 已自动加入装载列表；重启后生效）',
        restarting: restarted,
        output: tail(out, 1500),
      }
    }
    return { ok: false, message: '安装失败（退出码 ' + res.exitCode + '）', output: tail(out, 2000) }
  }

  async function uninstall(name: string): Promise<ManagerResult> {
    if (!name) return { ok: false, message: '缺少插件名' }
    const dir = profilePath(profile)
    const res = await execBash('dsh plugin --profile ' + profile + ' remove ' + shellQuote(name), 300000)
    const out = ((res.stdout || '') + '\n' + (res.stderr || '')).trim()
    if (res.exitCode !== 0) {
      return { ok: false, message: '卸载失败（退出码 ' + res.exitCode + '）', output: tail(out, 2000) }
    }
    // 清理可能残留的停用/装载条目
    const patchText = await readText(dir + '/cordis.patch.yml')
    let cleaned = patchWithoutStop(patchText, name)
    if (patchHasLoad(cleaned, name)) cleaned = patchWithoutLoad(cleaned, name)
    if (cleaned !== patchText) await writeText(dir + '/cordis.patch.yml', cleaned)
    const restarted = await scheduleRestart()
    return {
      ok: true,
      message: restarted
        ? '已卸载 ' + name + '，正在自动重启 dsh web（约 10 秒后刷新页面生效）'
        : '已卸载 ' + name + '（重启后不再装载）',
      restarting: restarted,
      output: tail(out, 1500),
    }
  }

  async function stop(name: string): Promise<ManagerResult> {
    const dir = profilePath(profile)
    const listRes = await list()
    const plugin = listRes.plugins && listRes.plugins.find((p: PluginView) => p.name === name)
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
    // 兜底：patch 里无 entry 可定位——若由本管理器装载（insert 条目）则整块移除；
    // 否则从 bundles 列表移除（下次 dsh plugin 命令可能被 reconcile 加回）
    const patchText2 = await readText(dir + '/cordis.patch.yml')
    if (patchHasLoad(patchText2, name)) {
      const cleaned = patchWithoutLoad(patchText2, name)
      const ok = await writeText(dir + '/cordis.patch.yml', cleaned)
      return ok
        ? { ok: true, message: '已停用 ' + name + '（已从 profile patch 移除装载条目；重启后生效）' }
        : { ok: false, message: '写入 cordis.patch.yml 失败' }
    }
    // 仅由 agent preset 组合装载（dsh ≥ 0.1.2）：本管理器只改 profile 的 bundles /
    // cordis.patch.yml，动不了预设组合，明确告知而不是去改无关的 bundles 列表。
    if (plugin.presets.length && !plugin.inBundles) {
      return {
        ok: false,
        message: name + ' 由 agent preset 组合装载（' + plugin.presets.join('、') + '），'
          + '请在对应预设的 cordis.yml 中移除该行；profile 的 bundles/patch 不影响它',
      }
    }
    const mres = await updateManifest(dir, (m) => {
      const mDsh = (m.dsh && typeof m.dsh === 'object' ? m.dsh : {}) as { profile?: { bundles?: unknown } }
      const mProfile = mDsh.profile && typeof mDsh.profile === 'object' ? mDsh.profile : {}
      const bundles = Array.isArray(mProfile.bundles) ? mProfile.bundles.filter((b): b is string => typeof b === 'string') : []
      mProfile.bundles = bundles.filter((b) => b !== name)
    })
    return {
      ok: mres.ok,
      message: mres.ok
        ? '已停用 ' + name + '（未能定位 patch 条目，改为从 bundles 列表移除；重启后生效）'
        : mres.message,
    }
  }

  async function start(name: string): Promise<ManagerResult> {
    const dir = profilePath(profile)
    const listRes = await list()
    const plugin = listRes.plugins && listRes.plugins.find((p: PluginView) => p.name === name)
    if (!plugin) return { ok: false, message: '未找到插件 ' + name }
    // 1) 移除停用 patch 条目
    const patchText = await readText(dir + '/cordis.patch.yml')
    let message: string | null = null
    if (patchHasStop(patchText, name)) {
      const cleaned = patchWithoutStop(patchText, name)
      const ok = await writeText(dir + '/cordis.patch.yml', cleaned)
      if (!ok) return { ok: false, message: '写入 cordis.patch.yml 失败' }
      message = '已启用 ' + name + '（已从 profile patch 移除停用条目；重启后生效）'
    }
    // 2) 若不在 bundles 且声明了 dsh.bundle，补回装载列表
    if (!plugin.inBundles && plugin.isBundle && plugin.installed) {
      const mres = await updateManifest(dir, (m) => {
        const mDsh = (m.dsh && typeof m.dsh === 'object' ? m.dsh : {}) as { profile?: { bundles?: unknown } }
        const mProfile = mDsh.profile && typeof mDsh.profile === 'object' ? mDsh.profile : {}
        if (!Array.isArray(mProfile.bundles)) mProfile.bundles = []
        const list = mProfile.bundles as unknown[]
        if (list.indexOf(name) === -1) list.push(name)
      })
      if (!mres.ok) return mres
      message = message || ('已加入装载列表：' + name + '（重启后生效）')
    }
    // 3) 已安装但未装载的非 bundle 插件：写 insert 条目装载。
    //    bundle 插件走步骤 2 的 bundles 列表；非 bundle（无 dsh.bundle，如只声明
    //    dsh.client 的插件）无法进 bundles——dsh plugin 的 reconcile 会把这类依赖
    //    从 bundles 踢出，必须用 profile 的 cordis.patch.yml insert 条目装载。
    if (!plugin.isBundle && plugin.installed && !plugin.mounted) {
      const current = await readText(dir + '/cordis.patch.yml')
      if (!patchHasLoad(current, name)) {
        const entryId = 'pmgr-' + String(name).replace(/^@[^/]+\//, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
        const next = patchAppend(current, loadAddition(name, entryId))
        const ok = await writeText(dir + '/cordis.patch.yml', next)
        if (!ok) return { ok: false, message: '写入 cordis.patch.yml 失败' }
        message = message || ('已装载 ' + name + '（已写入 profile 的 cordis.patch.yml；重启后生效）')
      } else {
        message = message || ('已装载 ' + name + '（重启后生效）')
      }
    }
    return { ok: true, message: message || (name + ' 未处于停用状态') }
  }

  // GitHub 仓库搜索（内部复用）：返回 { ok, items|message, rateLimited, noToken }
  async function githubSearch(q: string) {
    const url = 'https://api.github.com/search/repositories?q=' + encodeURIComponent(q) + '&sort=stars&order=desc&per_page=20'
    const headers: Record<string, string> = { 'User-Agent': 'dsh-plugin-manager', Accept: 'application/vnd.github+json' }
    const token = loadGithubToken()
    const noToken = !token
    if (token) headers.Authorization = 'Bearer ' + token
    try {
      const res = await fetch(url, { headers })
      if (res.status === 403 || res.status === 429) {
        return {
          ok: false,
          rateLimited: true,
          noToken,
          message: 'GitHub API 触发频率限制。可全局配置 token 提高限额：export GH_TOKEN=xxx（或运行 gh auth login）后重试',
          items: [],
        }
      }
      if (res.status === 401) {
        return { ok: false, noToken, message: 'GitHub token 无效或已过期，请检查 GH_TOKEN / gh auth login', items: [] }
      }
      if (!res.ok) return { ok: false, noToken, message: 'GitHub 搜索失败 HTTP ' + res.status, items: [] }
      const data = await res.json() as { items?: unknown[] }
      const items = (data.items || []).map((r) => {
        const row = r as Record<string, unknown>
        const owner = row.owner && typeof row.owner === 'object' ? (row.owner as Record<string, unknown>).login : ''
        return {
          fullName: String(row.full_name || ''),
          name: String(row.name || ''),
          description: String(row.description || ''),
          htmlUrl: String(row.html_url || ''),
          stars: Number(row.stargazers_count || 0),
          owner: typeof owner === 'string' ? owner : '',
          defaultBranch: String(row.default_branch || 'main'),
        }
      })
      return { ok: true, noToken, items }
    } catch (e) {
      return { ok: false, noToken, message: 'GitHub 搜索失败: ' + String((e && (e as Error).message) || e), items: [] }
    }
  }

  // 搜索 GitHub 上的 dsh-plugin 插件（topic:dsh-plugin）
  async function search(query: unknown) {
    const raw = typeof query === 'string' ? query.trim() : ''
    const q = raw === '' ? 'topic:dsh-plugin' : raw + ' topic:dsh-plugin'
    const res = await githubSearch(q)
    return res.ok
      ? { ok: true, query: raw, items: res.items, noToken: res.noToken }
      : { ok: false, message: res.message, rateLimited: res.rateLimited, noToken: res.noToken }
  }

  // 解析裸包名：先探测公共 npm，404 再搜 GitHub，区分 npm / github / none
  async function resolve(name: unknown) {
    const raw = typeof name === 'string' ? name.trim() : ''
    if (!raw) return { ok: false, message: '缺少插件名' }
    // ① 探测公共 npm registry（HEAD 仅取状态码，避免下载整包元数据）
    try {
      const npmRes = await fetch('https://registry.npmjs.org/' + encodeURIComponent(raw), { method: 'HEAD' })
      if (npmRes.ok) return { ok: true, input: raw, type: 'npm', spec: raw, candidates: [] }
    } catch { /* 网络异常时继续走 GitHub 搜索 */ }
    // ② npm 404 → 搜 GitHub（先 topic:dsh-plugin，无结果退化为纯名字搜索）
    let gh = await githubSearch(raw + ' in:name topic:dsh-plugin')
    if (gh.ok && gh.items.length === 0) gh = await githubSearch(raw + ' in:name')
    if (!gh.ok) return { ok: false, message: gh.message, rateLimited: gh.rateLimited, noToken: gh.noToken }
    if (gh.items.length === 0) return { ok: true, input: raw, type: 'none', spec: null, candidates: [], noToken: gh.noToken }
    return { ok: true, input: raw, type: 'github', spec: null, candidates: gh.items, noToken: gh.noToken }
  }

  async function setSettings(patch: unknown) {
    const current = await readSettings()
    const next = { ...current, ...(patch && typeof patch === 'object' ? patch : {}) }
    await writeSettings(next)
    return { ok: true, settings: next }
  }

  async function restart(): Promise<ManagerResult> {
    const started = await scheduleRestart(true)
    return started
      ? { ok: true, restarting: true, message: '正在自动重启 dsh web（约 10 秒后刷新页面生效）' }
      : { ok: false, message: '无法启动自动重启' }
  }

  return { list, install, uninstall, stop, start, setSettings, restart, search, resolve }
}

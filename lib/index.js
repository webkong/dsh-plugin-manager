// dsh-plugin-manager — Host 半部
// 基于 profile manifest / cordis.patch.yml / dsh CLI 管理 DSH 插件。
// 领域事实：
//  - 每个 profile 目录 ~/.dsh/profiles/<name>/ 下有 package.json（dependencies + dsh.profile.bundles）
//    与 cordis.patch.yml（用户 patch 层，改动在下次启动时由 loader 应用；若 HMR 激活则即时生效）。
//  - dsh.profile.bundles 是启动时装载的 bundle 列表；dependencies 是已安装依赖。
//  - 内置插件以 @deepseek-ai/* 形式存在于 dsh 安装目录；三方插件由 pnpm 装入 profile。
//  - 停用一个 bundle = 在 cordis.patch.yml 写入 { id, name, disabled: true }（对 reconcile 免疫）。
// 通信：通过 webServer 前缀路由 /pmgr 提供 HTTP API（与 @deepseek-ai/dsh-plugin-console 同方案），
//       客户端用浏览器 fetch 调用，不依赖 Typert Remote，因此插件本身无需任何 @deepseek-ai 依赖，
//       放在任意本地路径（如工作区）都不会出现模块实例分裂导致的“端点 404”。

export const name = 'dsh-plugin-manager'
export const inject = ['webServer']

const MARKER = 'dsh-plugin-manager'

function q(s) {
  return "'" + String(s).replace(/'/g, "'\\''") + "'"
}

// 批量解析包目录：先按 profile 锚点（三方），再按 dsh 安装锚点（内置）。
// createRequire(...).resolve('name/package.json') 返回 package.json 文件路径，统一裁剪为包目录。
async function resolvePackageDirs(runSh, names, profileDir, installPkgDir) {
  if (!names || !names.length) return {}
  const script = [
    "const { createRequire } = require('module');",
    'const bases = JSON.parse(process.argv[1]);',
    'const names = JSON.parse(process.argv[2]);',
    'const out = {};',
    'for (const n of names) {',
    '  let found = null;',
    '  for (const base of bases) {',
    '    try { found = createRequire(base + "/package.json").resolve(n + "/package.json"); break; } catch (e) {}',
    '  }',
    '  out[n] = found;',
    '}',
    "console.log(JSON.stringify(out));",
  ].join('\n')
  const bases = [profileDir]
  if (installPkgDir) bases.push(installPkgDir)
  const res = await runSh('node -e ' + q(script) + ' ' + q(JSON.stringify(bases)) + ' ' + q(JSON.stringify(names)), 20000)
  try {
    const raw = JSON.parse(res.stdout || '{}')
    const out = {}
    for (const k of Object.keys(raw)) {
      out[k] = raw[k] ? raw[k].replace(/\/package\.json$/, '') : null
    }
    return out
  } catch (e) {
    return {}
  }
}

async function readPackageMetas(runSh, dirs) {
  const entries = Object.entries(dirs).filter(([, d]) => !!d)
  if (!entries.length) return {}
  const script = [
    "const fs = require('fs');",
    'const dirs = JSON.parse(process.argv[1]);',
    'const out = {};',
    'for (const [name, dir] of Object.entries(dirs)) {',
    '  try {',
    '    const p = JSON.parse(fs.readFileSync(dir + "/package.json", "utf8"));',
    '    out[name] = {',
    '      version: typeof p.version === "string" ? p.version : null,',
    '      description: typeof p.description === "string" ? p.description : null,',
    '      homepage: typeof p.homepage === "string" ? p.homepage : null,',
    '      repository: typeof p.repository === "string" ? p.repository : (p.repository && typeof p.repository.url === "string" ? p.repository.url : null),',
    '      bundlePatch: p.dsh && p.dsh.bundle && typeof p.dsh.bundle.patch === "string" ? p.dsh.bundle.patch : null,',
    '    };',
    '  } catch (e) { out[name] = null; }',
    '}',
    "console.log(JSON.stringify(out));",
  ].join('\n')
  const res = await runSh('node -e ' + q(script) + ' ' + q(JSON.stringify(Object.fromEntries(entries))), 20000)
  try {
    const raw = JSON.parse(res.stdout || '{}')
    const out = {}
    for (const [name] of entries) out[name] = raw[name] || null
    return out
  } catch (e) {
    return {}
  }
}

// 从 bundle 的 cordis.patch.yml 提取 name 等于包名的装载条目 id
function findEntryIds(yamlText, packageName) {
  const ids = []
  if (!yamlText) return ids
  const lines = yamlText.split('\n')
  const items = []
  let cur = null
  for (const line of lines) {
    if (/^-\s/.test(line) || line.trim() === '-') {
      if (cur) items.push(cur)
      cur = [line]
    } else if (cur) {
      cur.push(line)
    }
  }
  if (cur) items.push(cur)
  for (const item of items) {
    const head = (item[0] || '').trim()
    const inline = head.match(/insert:\s*\[/)
    if (!/^- insert:/.test(head) && !inline) continue
    if (inline) {
      const text = item.join(' ')
      const re = /\{\s*id:\s*['"]?([^'"},\s]+)['"]?[^}]*?name:\s*['"]?([^'"},\s]+)['"]?[^}]*?\}/g
      let m
      while ((m = re.exec(text))) {
        if (m[2] === packageName && !ids.includes(m[1])) ids.push(m[1])
      }
      continue
    }
    const entryBlocks = []
    let ecur = null
    for (const line of item.slice(1)) {
      if (/^\s+-\s/.test(line)) {
        if (ecur) entryBlocks.push(ecur)
        ecur = [line]
      } else if (ecur) {
        ecur.push(line)
      }
    }
    if (ecur) entryBlocks.push(ecur)
    for (const block of entryBlocks) {
      const text = block.join('\n')
      const idM = text.match(/^\s*-\s*id:\s*['"]?([^'"\s]+)['"]?\s*$/m)
      const nameM = text.match(/^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/m)
      const id = idM ? idM[1] : null
      const name = nameM ? nameM[1] : null
      if (id && (name === packageName || id === packageName) && !ids.includes(id)) ids.push(id)
    }
  }
  return ids
}

function githubUrlFromSpec(spec) {
  if (!spec) return undefined
  const s = String(spec).trim()
  let m = s.match(/^github:([^#@]+)/)
  if (m) return 'https://github.com/' + m[1].replace(/^\/+|\/+$/g, '')
  m = s.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:[#@]|$)/)
  if (m && !s.startsWith('@')) return 'https://github.com/' + m[1]
  return undefined
}

function githubUrlFromRepo(repo) {
  if (!repo) return undefined
  const s = String(repo)
  let m = s.match(/https?:\/\/github\.com\/[^\s'"#]+/)
  if (m) return m[0].replace(/\.git(\/.*)?$/, '').replace(/\/+$/, '')
  m = s.match(/git@github\.com:([^\s'"]+)/)
  if (m) return 'https://github.com/' + m[1].replace(/\.git$/, '')
  return undefined
}

function specSource(spec) {
  if (!spec) return 'unknown'
  const s = String(spec)
  if (/^github:/.test(s) || /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:[#@]|$)/.test(s)) return 'github'
  if (/^(file|link|workspace):/.test(s)) return 'local'
  return 'npm'
}

function patchHasStop(patchText, name) {
  return patchText.indexOf('# ' + MARKER + ': stop ' + name) !== -1
}

function patchWithStop(patchText, addition) {
  const lines = patchText.split('\n')
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  if (lines.length && lines[lines.length - 1].trim() === '[]') lines.pop()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  const base = lines.join('\n')
  const add = addition.trimEnd() + '\n'
  return base.length ? base + '\n' + add : add
}

function patchWithoutStop(patchText, name) {
  const marker = '# ' + MARKER + ': stop ' + name
  const lines = patchText.split('\n')
  const out = []
  let skipping = false
  for (const line of lines) {
    if (line.startsWith(marker)) {
      skipping = true
      continue
    }
    if (skipping) {
      if (/^-\s/.test(line) || /^\s{2,}/.test(line)) continue
      skipping = false
    }
    out.push(line)
  }
  const result = out.join('\n')
  const meaningful = result.split('\n').filter((l) => {
    const t = l.trim()
    return t && !t.startsWith('#')
  })
  return meaningful.length ? result : '[]\n'
}

function stopAddition(name, ids) {
  return ids
    .map((id) => '# ' + MARKER + ': stop ' + name + ' (auto-managed)\n- id: ' + id + '\n  name: ' + q(name) + '\n  disabled: true\n')
    .join('\n')
}

function tail(text, max) {
  if (!text) return ''
  return text.length > max ? '…' + text.slice(-max) : text
}

// 实现体：持有 ctx、profile 与所有文件/命令逻辑
function createImpl(ctx, profile) {
  const shell = ctx.get('shell')
  const inventory = ctx.get('pluginInventory')

  async function runSh(command, timeoutMs) {
    if (!shell) {
      return { exitCode: -1, stdout: '', stderr: 'shell service unavailable', timedOut: false }
    }
    try {
      const request = { command, timeoutMs: timeoutMs || 60000 }
      const spec = shell.resolve(request)
      const res = await shell.run(spec)
      return {
        exitCode: typeof res.exitCode === 'number' ? res.exitCode : -1,
        stdout: typeof res.stdout === 'string' ? res.stdout : '',
        stderr: typeof res.stderr === 'string' ? res.stderr : '',
        timedOut: !!res.timedOut,
      }
    } catch (e) {
      return { exitCode: -1, stdout: '', stderr: String((e && e.message) || e), timedOut: false }
    }
  }

  async function profilePaths() {
    const homeRes = await runSh('printf %s "${DSH_HOME:-$HOME/.dsh}"', 10000)
    const home = (homeRes.stdout || '').trim()
    return { home, dir: home + '/profiles/' + profile }
  }

  async function readText(absPath) {
    const res = await runSh('cat ' + q(absPath) + ' 2>/dev/null || true', 15000)
    return res.stdout
  }

  async function writeText(absPath, content) {
    const tmp = absPath + '.pm-tmp'
    const res = await runSh(
      'cat > ' + q(tmp) + " <<'DSHPM_EOF'\n" + content + '\nDSHPM_EOF\nmv -f ' + q(tmp) + ' ' + q(absPath),
      15000
    )
    return res.exitCode === 0
  }

  async function readManifest(dir) {
    const text = await readText(dir + '/package.json')
    if (!text.trim()) return null
    try {
      return JSON.parse(text)
    } catch (e) {
      console.log('dsh-plugin-manager: manifest parse failed', String(e))
      return null
    }
  }

  async function updateManifest(dir, mutate) {
    const manifest = await readManifest(dir)
    if (!manifest) return { ok: false, message: '无法读取 profile manifest' }
    try {
      mutate(manifest)
    } catch (e) {
      return { ok: false, message: String((e && e.message) || e) }
    }
    const ok = await writeText(dir + '/package.json', JSON.stringify(manifest, null, 2) + '\n')
    return { ok, message: ok ? '已更新 profile manifest' : '写入 profile manifest 失败' }
  }

  async function list() {
    const { home, dir } = await profilePaths()
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

    // dsh 安装目录（用于内置插件解析与分类）
    const dshCmd = "DSH_BIN=\"$(command -v dsh)\"; if [ -n \"$DSH_BIN\" ]; then node -e \"console.log(require('fs').realpathSync(process.argv[1]))\" \"$DSH_BIN\" 2>/dev/null; fi"
    const dshRes = await runSh(dshCmd, 15000)
    const dshReal = (dshRes.stdout || '').trim()
    const installPkgDir = dshReal ? dshReal.split('/').slice(0, -2).join('/') : ''

    const names = []
    const seen = new Set()
    for (const n of bundles) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }
    for (const n of Object.keys(deps)) {
      if (!seen.has(n)) { seen.add(n); names.push(n) }
    }

    const dirs = await resolvePackageDirs(runSh, names, dir, installPkgDir)
    const metas = await readPackageMetas(runSh, dirs)

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
      dshHome: home,
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
    const res = await runSh('dsh plugin --profile ' + profile + ' add ' + q(clean), 300000)
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
    const { dir } = await profilePaths()
    const res = await runSh('dsh plugin --profile ' + profile + ' remove ' + q(name), 300000)
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
    const { dir } = await profilePaths()
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
    const { dir } = await profilePaths()
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

//#region HTTP 辅助（与 @deepseek-ai/dsh-plugin-console 相同约定）
function isLoopback(address) {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1' || address === 'localhost'
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(payload)
}

function sendError(res, status, message, details) {
  sendJson(res, status, { ok: false, error: message, ...(details === undefined ? {} : { details }) })
}

async function readBody(req, maxBytes = 64 * 1024) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > maxBytes) throw new Error('请求体过大')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('请求体不是合法 JSON')
  }
}
//#endregion

// 插件入口：注册 /pmgr 前缀路由
export function apply(ctx, config) {
  const profile = (config && config.profile) || 'web'
  const impl = createImpl(ctx, profile)
  const webServer = ctx.get('webServer')
  if (webServer === undefined) {
    console.log('dsh-plugin-manager: webServer 不可用，跳过路由注册')
    return
  }
  ctx.effect(() => {
    const route = {
      kind: 'prefix',
      path: '/pmgr',
      handler: async (req, res) => {
        if (!isLoopback(req.socket?.remoteAddress ?? '')) {
          sendError(res, 403, '仅允许本机访问')
          return
        }
        try {
          const url = new URL(req.url ?? '/', 'http://x')
          const pathname = url.pathname
          const method = req.method ?? 'GET'
          if (method === 'GET' && pathname === '/pmgr/list') {
            sendJson(res, 200, await impl.list())
            return
          }
          if (method !== 'POST') {
            sendError(res, 405, 'method not allowed')
            return
          }
          const body = await readBody(req)
          if (pathname === '/pmgr/install') {
            sendJson(res, 200, await impl.install(body.spec))
          } else if (pathname === '/pmgr/uninstall') {
            sendJson(res, 200, await impl.uninstall(body.name))
          } else if (pathname === '/pmgr/stop') {
            sendJson(res, 200, await impl.stop(body.name))
          } else if (pathname === '/pmgr/start') {
            sendJson(res, 200, await impl.start(body.name))
          } else {
            sendError(res, 404, 'not found')
          }
        } catch (error) {
          sendError(res, 500, error instanceof Error ? error.message : String(error))
        }
      },
    }
    return webServer.register(route)
  }, 'dsh-plugin-manager: routes')
  console.log('dsh-plugin-manager: host ready (profile=' + profile + ', routes=/pmgr/*)')
}

export {
  findEntryIds,
  githubUrlFromSpec,
  githubUrlFromRepo,
  specSource,
  patchHasStop,
  patchWithStop,
  patchWithoutStop,
  stopAddition,
}

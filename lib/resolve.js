// 包目录与元数据解析：双锚点（profile 锚点 → dsh 安装锚点）批量解析。
// createRequire(...).resolve('name/package.json') 返回 package.json 文件路径，统一裁剪为包目录。
function q(s) {
  return "'" + String(s).replace(/'/g, "'\\''") + "'"
}

export async function resolvePackageDirs(runSh, names, profileDir, installPkgDir) {
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

export async function readPackageMetas(runSh, dirs) {
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

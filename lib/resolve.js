// 包目录与元数据解析：双锚点（profile 锚点 → dsh 安装锚点）进程内解析。
// createRequire(...).resolve('name/package.json') 返回 package.json 文件路径，统一裁剪为包目录。
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function resolvePackageDirs(names, profileDir, installPkgDir) {
  if (!names || !names.length) return {}
  const bases = [profileDir]
  if (installPkgDir) bases.push(installPkgDir)
  const out = {}
  for (const n of names) {
    let found = null
    for (const base of bases) {
      try {
        found = createRequire(join(base, 'package.json')).resolve(n + '/package.json')
        break
      } catch {
        // 尝试下一锚点
      }
    }
    out[n] = found ? found.replace(/\/package\.json$/, '') : null
  }
  return out
}

export function readPackageMetas(dirs) {
  const out = {}
  for (const [name, dir] of Object.entries(dirs)) {
    if (!dir) continue
    try {
      const p = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
      out[name] = {
        version: typeof p.version === 'string' ? p.version : null,
        description: typeof p.description === 'string' ? p.description : null,
        homepage: typeof p.homepage === 'string' ? p.homepage : null,
        repository: typeof p.repository === 'string' ? p.repository : (p.repository && typeof p.repository.url === 'string' ? p.repository.url : null),
        bundlePatch: p.dsh && p.dsh.bundle && typeof p.dsh.bundle.patch === 'string' ? p.dsh.bundle.patch : null,
      }
    } catch {
      out[name] = null
    }
  }
  return out
}

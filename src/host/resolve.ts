// 包目录与元数据解析：双锚点（profile 锚点 → dsh 安装锚点）进程内解析。
// createRequire(...).resolve('name/package.json') 返回 package.json 文件路径，统一裁剪为包目录。
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function resolvePackageDirs(
  names: readonly string[],
  profileDir: string,
  installPkgDir: string | undefined,
): Record<string, string | null> {
  if (!names || !names.length) return {}
  const bases = [profileDir]
  if (installPkgDir) bases.push(installPkgDir)
  const resolvers = bases.map((base) => createRequire(join(base, 'package.json')))
  const out: Record<string, string | null> = {}
  for (const n of names) {
    let found: string | null = null
    for (const req of resolvers) {
      try {
        found = req.resolve(n + '/package.json')
        break
      } catch {
        // 尝试下一锚点
      }
    }
    out[n] = found ? found.replace(/\/package\.json$/, '') : null
  }
  return out
}

export interface PackageMeta {
  version: string | null
  description: string | null
  homepage: string | null
  repository: string | null
  bundlePatch: string | null
}

export function readPackageMetas(dirs: Record<string, string | null>): Record<string, PackageMeta | null> {
  const out: Record<string, PackageMeta | null> = {}
  for (const [name, dir] of Object.entries(dirs)) {
    if (!dir) continue
    try {
      const p: Record<string, unknown> = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
      const repo = p.repository
      out[name] = {
        version: typeof p.version === 'string' ? p.version : null,
        description: typeof p.description === 'string' ? p.description : null,
        homepage: typeof p.homepage === 'string' ? p.homepage : null,
        repository:
          typeof repo === 'string' ? repo : repo && typeof repo === 'object' && typeof (repo as { url?: unknown }).url === 'string' ? (repo as { url: string }).url : null,
        bundlePatch: p.dsh && typeof p.dsh === 'object' && (p.dsh as { bundle?: { patch?: unknown } }).bundle && typeof (p.dsh as { bundle: { patch?: unknown } }).bundle.patch === 'string'
          ? (p.dsh as { bundle: { patch: string } }).bundle.patch
          : null,
      }
    } catch {
      out[name] = null
    }
  }
  return out
}

// 文件与子进程工具（直接使用 node API，不依赖 dsh 的 shell 服务）。
// 方案：node:fs + node:child_process，
// 子进程默认继承 process.env（shell 服务反而会剥离环境变量，导致 $HOME/$PATH 为空）。
import { readFile, writeFile, rename } from 'node:fs/promises'
import { existsSync, realpathSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { join } from 'node:path'

export function dshHome(): string {
  return process.env.DSH_HOME || join(process.env.HOME || '', '.dsh')
}

export function profilePath(profile: string): string {
  return join(dshHome(), 'profiles', profile)
}

export async function readText(absPath: string): Promise<string> {
  try {
    return await readFile(absPath, 'utf8')
  } catch {
    return ''
  }
}

export async function writeText(absPath: string, content: string): Promise<boolean> {
  const tmp = absPath + '.pm-tmp'
  await writeFile(tmp, content, 'utf8')
  await rename(tmp, absPath)
  return true
}

export async function readManifest(dir: string): Promise<Record<string, unknown> | null> {
  const text = await readText(join(dir, 'package.json'))
  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch (e) {
    console.log('dsh-plugin-manager: manifest parse failed', String(e))
    return null
  }
}

export interface MutateResult {
  ok: boolean
  message: string
}

export async function updateManifest(dir: string, mutate: (manifest: Record<string, unknown>) => void): Promise<MutateResult> {
  const manifest = await readManifest(dir)
  if (!manifest) return { ok: false, message: '无法读取 profile manifest' }
  try {
    mutate(manifest)
  } catch (e) {
    return { ok: false, message: String((e && (e as Error).message) || e) }
  }
  try {
    await writeText(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
    return { ok: true, message: '已更新 profile manifest' }
  } catch (e) {
    return { ok: false, message: '写入 profile manifest 失败: ' + String((e && (e as Error).message) || e) }
  }
}

export interface BashResult {
  exitCode: number
  stdout: string
  stderr: string
  timedOut: boolean
}

// 执行一条 bash 命令（用于 dsh plugin 等），子进程继承 process.env
export function execBash(command: string, timeoutMs = 60000): Promise<BashResult> {
  return new Promise((resolve) => {
    execFile('/bin/bash', ['-c', command], { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && (error as NodeJS.ErrnoException).code === 'ETIMEDOUT') {
        resolve({ exitCode: -1, stdout: String(stdout || ''), stderr: String(stderr || '') + '\n超时', timedOut: true })
        return
      }
      resolve({
        exitCode: error ? (typeof (error as NodeJS.ErrnoException).code === 'number' ? (error as NodeJS.ErrnoException).code as unknown as number : 1) : 0,
        stdout: String(stdout || ''),
        stderr: String(stderr || ''),
        timedOut: false,
      })
    })
  })
}

// 插件设置持久化：~/.dsh/dsh-plugin-manager.json（自动重启开关等）
export function settingsPath(): string {
  return join(dshHome(), 'dsh-plugin-manager.json')
}

export interface PmgrSettings {
  autoRestart: boolean
}

export async function readSettings(): Promise<PmgrSettings> {
  try {
    const raw = await readText(settingsPath())
    const parsed = raw.trim() ? JSON.parse(raw) : {}
    return { autoRestart: parsed.autoRestart === true }
  } catch {
    return { autoRestart: false }
  }
}

export async function writeSettings(settings: PmgrSettings): Promise<PmgrSettings> {
  await writeText(settingsPath(), JSON.stringify(settings, null, 2) + '\n')
  return settings
}

// 定位 dsh 安装包目录（用于内置插件解析）：
// ① 进程内解析 —— 插件与 dsh 通常装在同一 node_modules 树里，命中的就是「当前正在运行」的发行版；
//    混装场景（例如 PATH 上是 0.1.1 全局安装、实际运行的是本地 0.1.2）必须以这一份为准。
// ② 回退 PATH：在 PATH 里找 dsh bin → realpath → 包目录。
export function findDshPkgDir(): string {
  try {
    const resolved = createRequire(import.meta.url).resolve('@deepseek-ai/dsh/package.json')
    return resolved.replace(/\/package\.json$/, '')
  } catch { /* 未与 dsh 同树安装，走 PATH */ }
  const pathEnv = process.env.PATH || ''
  for (const dir of pathEnv.split(':')) {
    if (!dir) continue
    const bin = join(dir, 'dsh')
    if (!existsSync(bin)) continue
    try {
      const real = realpathSync(bin)
      return real.split('/').slice(0, -2).join('/')
    } catch {
      return ''
    }
  }
  return ''
}

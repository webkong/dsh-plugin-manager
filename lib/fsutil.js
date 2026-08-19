// 文件与子进程工具（直接使用 node API，不依赖 dsh 的 shell 服务）。
// 与 @deepseek-ai/dsh-plugin-console 同方案：node:fs + node:child_process，
// 子进程默认继承 process.env（shell 服务反而会剥离环境变量，导致 $HOME/$PATH 为空）。
import { readFile, writeFile, rename } from 'node:fs/promises'
import { existsSync, realpathSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { join } from 'node:path'

export function profilePath(profile) {
  const home = process.env.DSH_HOME || join(process.env.HOME || '', '.dsh')
  return join(home, 'profiles', profile)
}

export async function readText(absPath) {
  try {
    return await readFile(absPath, 'utf8')
  } catch {
    return ''
  }
}

export async function writeText(absPath, content) {
  const tmp = absPath + '.pm-tmp'
  await writeFile(tmp, content, 'utf8')
  await rename(tmp, absPath)
  return true
}

export async function readManifest(dir) {
  const text = await readText(join(dir, 'package.json'))
  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch (e) {
    console.log('dsh-plugin-manager: manifest parse failed', String(e))
    return null
  }
}

export async function updateManifest(dir, mutate) {
  const manifest = await readManifest(dir)
  if (!manifest) return { ok: false, message: '无法读取 profile manifest' }
  try {
    mutate(manifest)
  } catch (e) {
    return { ok: false, message: String((e && e.message) || e) }
  }
  try {
    await writeText(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
    return { ok: true, message: '已更新 profile manifest' }
  } catch (e) {
    return { ok: false, message: '写入 profile manifest 失败: ' + String((e && e.message) || e) }
  }
}

// 执行一条 bash 命令（用于 dsh plugin 等），子进程继承 process.env
export function execBash(command, timeoutMs = 60000) {
  return new Promise((resolve) => {
    execFile('/bin/bash', ['-c', command], { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && error.code === 'ETIMEDOUT') {
        resolve({ exitCode: -1, stdout: String(stdout || ''), stderr: String(stderr || '') + '\n超时', timedOut: true })
        return
      }
      resolve({
        exitCode: error ? (typeof error.code === 'number' ? error.code : 1) : 0,
        stdout: String(stdout || ''),
        stderr: String(stderr || ''),
        timedOut: false,
      })
    })
  })
}

// 定位 dsh 安装包目录（用于内置插件解析）：PATH 中找 dsh bin → realpath → 包目录
export function findDshPkgDir() {
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

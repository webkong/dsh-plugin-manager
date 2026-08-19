// shell 与 profile 文件操作。
// 注意：dsh 的 shell 服务不会自动继承 process.env（只注入 ENV_OVERRIDES），
// 因此必须显式传 env: process.env，否则 $HOME/$PATH/$DSH_HOME 在子进程里为空，
// 导致 profile 目录解析错误（如 /profiles/web）或 node/dsh 找不到。
import { NAME } from './constants.js'

export function createShell(ctx) {
  const shell = ctx.get('shell')

  function q(s) {
    return "'" + String(s).replace(/'/g, "'\\''") + "'"
  }

  async function runSh(command, timeoutMs) {
    if (!shell) {
      return { exitCode: -1, stdout: '', stderr: 'shell service unavailable', timedOut: false }
    }
    try {
      const spec = shell.resolve({ command, timeoutMs: timeoutMs || 60000, env: process.env })
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

  async function profilePaths(profile) {
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
      console.log(NAME + ': manifest parse failed', String(e))
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

  return { runSh, profilePaths, readText, writeText, readManifest, updateManifest, q }
}

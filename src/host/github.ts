// GitHub 仓库 URL 提取与依赖来源判定
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export function githubUrlFromSpec(spec: unknown): string | undefined {
  if (!spec) return undefined
  const s = String(spec).trim()
  let m = s.match(/^github:([^#@]+)/)
  if (m) return 'https://github.com/' + m[1].replace(/^\/+|\/+$/g, '')
  m = s.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:[#@]|$)/)
  if (m && !s.startsWith('@')) return 'https://github.com/' + m[1]
  return undefined
}

export function githubUrlFromRepo(repo: unknown): string | undefined {
  if (!repo) return undefined
  const s = String(repo)
  let m = s.match(/https?:\/\/github\.com\/[^\s'"#]+/)
  if (m) return m[0].replace(/\.git(\/.*)?$/, '').replace(/\/+$/, '')
  m = s.match(/git@github\.com:([^\s'"]+)/)
  if (m) return 'https://github.com/' + m[1].replace(/\.git$/, '')
  return undefined
}

export function specSource(spec: unknown): string {
  if (!spec) return 'unknown'
  const s = String(spec)
  if (/^github:/.test(s) || /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:[#@]|$)/.test(s)) return 'github'
  if (/^(file|link|workspace):/.test(s)) return 'local'
  return 'npm'
}

// 从本机多处读取 GitHub token：环境变量 → gh CLI 配置 → shell rc → git config。
// 返回 token 字符串或 null（未配置）。
export function loadGithubToken(): string | null {
  // ① 环境变量
  const env = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  if (env && env.trim()) return env.trim()
  try {
    const home = homedir()
    // ② gh CLI 配置 ~/.config/gh/hosts.yml 的 oauth_token
    const gh = join(home, '.config', 'gh', 'hosts.yml')
    if (existsSync(gh)) {
      const m = readFileSync(gh, 'utf8').match(/oauth_token:\s*([^\s]+)/)
      if (m && m[1]) return m[1]
    }
    // ③ shell rc 里的 export GH_TOKEN / GITHUB_TOKEN
    for (const f of ['.zshrc', '.zprofile', '.bashrc', '.bash_profile', '.profile']) {
      const p = join(home, f)
      if (!existsSync(p)) continue
      const m = readFileSync(p, 'utf8').match(/export\s+(?:GH_TOKEN|GITHUB_TOKEN)\s*=\s*["']?([^"'\s]+)/)
      if (m && m[1]) return m[1]
    }
    // ④ git config github.token（~/.gitconfig 的 [github] token）
    const gc = join(home, '.gitconfig')
    if (existsSync(gc)) {
      const m = readFileSync(gc, 'utf8').match(/\[github\][\s\S]*?token\s*=\s*([^\s]+)/)
      if (m && m[1]) return m[1]
    }
  } catch { /* 读取失败则视为未配置 */ }
  return null
}

// GitHub 仓库 URL 提取与依赖来源判定
export function githubUrlFromSpec(spec) {
  if (!spec) return undefined
  const s = String(spec).trim()
  let m = s.match(/^github:([^#@]+)/)
  if (m) return 'https://github.com/' + m[1].replace(/^\/+|\/+$/g, '')
  m = s.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:[#@]|$)/)
  if (m && !s.startsWith('@')) return 'https://github.com/' + m[1]
  return undefined
}

export function githubUrlFromRepo(repo) {
  if (!repo) return undefined
  const s = String(repo)
  let m = s.match(/https?:\/\/github\.com\/[^\s'"#]+/)
  if (m) return m[0].replace(/\.git(\/.*)?$/, '').replace(/\/+$/, '')
  m = s.match(/git@github\.com:([^\s'"]+)/)
  if (m) return 'https://github.com/' + m[1].replace(/\.git$/, '')
  return undefined
}

export function specSource(spec) {
  if (!spec) return 'unknown'
  const s = String(spec)
  if (/^github:/.test(s) || /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:[#@]|$)/.test(s)) return 'github'
  if (/^(file|link|workspace):/.test(s)) return 'local'
  return 'npm'
}

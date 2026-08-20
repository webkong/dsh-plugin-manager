// 安装 spec 客户端校验（与 Host lib/spec.js 同规则）
const GITHUB_SPEC = /^github:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[^\s]+)?$/
const GITHUB_SHORTHAND = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[^\s]+)?$/
const NPM_SPEC = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(?:@[^@\s]+)?$/
const LOCAL_SPEC = /^(file|link):.+|^\.{1,2}\/.+|^\/.+/
const URL_SPEC = /^https?:\/\/[^\s]+/

export function validateSpec(spec) {
  if (typeof spec !== 'string' || spec.trim() === '') {
    return { ok: false, error: '插件标识不能为空' }
  }
  const s = spec.trim()
  if (/\s/.test(s)) {
    return { ok: false, error: '插件标识不能包含空格' }
  }
  if (GITHUB_SPEC.test(s) || GITHUB_SHORTHAND.test(s) || NPM_SPEC.test(s) || LOCAL_SPEC.test(s) || URL_SPEC.test(s)) {
    return { ok: true, error: '' }
  }
  return { ok: false, error: '插件标识格式不正确（支持 npm 包名 / github:owner/repo#ref / 本地路径 / tarball URL）' }
}

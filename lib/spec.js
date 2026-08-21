// src/host/spec.ts
var GITHUB_SPEC = /^github:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[^\s]+)?$/;
var GITHUB_SHORTHAND = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[^\s]+)?$/;
var NPM_SPEC = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(?:@[^@\s]+)?$/;
var LOCAL_SPEC = /^(file|link):.+|^\.{1,2}\/.+|^\/.+/;
var URL_SPEC = /^https?:\/\/[^\s]+/;
function validateSpec(spec) {
  if (typeof spec !== "string" || spec.trim() === "") {
    return { ok: false, error: "\u63D2\u4EF6\u6807\u8BC6\u4E0D\u80FD\u4E3A\u7A7A" };
  }
  const s = spec.trim();
  if (/\s/.test(s)) {
    return { ok: false, error: "\u63D2\u4EF6\u6807\u8BC6\u4E0D\u80FD\u5305\u542B\u7A7A\u683C" };
  }
  if (GITHUB_SPEC.test(s) || GITHUB_SHORTHAND.test(s) || NPM_SPEC.test(s) || LOCAL_SPEC.test(s) || URL_SPEC.test(s)) {
    return { ok: true, error: "" };
  }
  return { ok: false, error: "\u63D2\u4EF6\u6807\u8BC6\u683C\u5F0F\u4E0D\u6B63\u786E\uFF08\u652F\u6301 npm \u5305\u540D / github:owner/repo#ref / \u672C\u5730\u8DEF\u5F84 / tarball URL\uFF09" };
}
export {
  validateSpec
};

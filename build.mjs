// 构建 lib/client.js：把 client/src 打包为 __ModuleLoader__ 单文件 bundle（CJS + external react）
import { build } from 'esbuild'
import { writeFileSync, mkdirSync } from 'node:fs'

const result = await build({
  entryPoints: ['client/src/index.js'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  external: ['react'],
  write: false,
  minify: false,
  target: 'es2020',
})

const code = result.outputFiles[0].text
const wrapped = `window.__ModuleLoader__.load({
  id: 'dsh-plugin-manager',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
${code}
    return module.exports;
  },
});
`

mkdirSync('lib', { recursive: true })
writeFileSync('lib/client.js', wrapped)
console.log(`built lib/client.js (${wrapped.length} bytes)`)

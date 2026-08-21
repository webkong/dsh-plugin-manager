// 构建：Host (src/host → lib/index.js, ESM) + Client (src/client → lib/client.js, __ModuleLoader__ bundle)
import { build } from 'esbuild'
import { writeFileSync, mkdirSync } from 'node:fs'

mkdirSync('lib', { recursive: true })

const shared = {
  bundle: true,
  target: 'es2020',
  minify: false,
  loader: { '.css': 'text' },
}

// 1) Host：ESM，Node 平台；node:* 内置模块由 esbuild 自动 external。
const hostResult = await build({
  ...shared,
  entryPoints: ['src/host/index.ts'],
  format: 'esm',
  platform: 'node',
  write: false,
})
writeFileSync('lib/index.js', hostResult.outputFiles[0].text)
console.log(`built lib/index.js (${hostResult.outputFiles[0].text.length} bytes)`)

// 2) Client：CJS + external react，包进 __ModuleLoader__.load
const clientResult = await build({
  ...shared,
  entryPoints: ['src/client/index.ts'],
  format: 'cjs',
  platform: 'browser',
  external: ['react'],
  write: false,
})
const wrapped = `window.__ModuleLoader__.load({
  id: '@webkong/dsh-plugin-manager',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
${clientResult.outputFiles[0].text}
    return module.exports;
  },
});
`
writeFileSync('lib/client.js', wrapped)
console.log(`built lib/client.js (${wrapped.length} bytes)`)

// 3) 纯函数子模块：供单元测试直接 import（保持 lib/*.js 路径兼容）。
//    每个模块 bundle 成自包含 ESM 文件（内联同目录依赖如 constants.ts），
//    保留 node:* 内置 external；测试可独立加载。
const pureModules = ['entryIds', 'github', 'patch', 'spec']
for (const name of pureModules) {
  const res = await build({
    entryPoints: [`src/host/${name}.ts`],
    format: 'esm',
    platform: 'node',
    bundle: true,
    write: false,
    target: 'es2020',
  })
  writeFileSync(`lib/${name}.js`, res.outputFiles[0].text)
  console.log(`built lib/${name}.js (${res.outputFiles[0].text.length} bytes)`)
}

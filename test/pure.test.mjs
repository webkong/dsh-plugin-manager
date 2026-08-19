// dsh-plugin-manager 纯函数单元测试（node --test，零外部依赖）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findEntryIds } from '../lib/entryIds.js'
import { githubUrlFromSpec, githubUrlFromRepo, specSource } from '../lib/github.js'
import { patchHasStop, patchWithStop, patchWithoutStop, stopAddition } from '../lib/patch.js'

const MARKER = 'dsh-plugin-manager'
const TEMPLATE = `# Your patch layer for this dsh profile, applied after every bundle layer:
# a top-level YAML array of loader patch entries (id-targeted config
# overrides, disables, and insert lists; \`!!js\` expressions allowed).
[]
`

// ---- findEntryIds：真实 bundle patch 回归 ----
const BETTER_SIDEBAR_PATCH = `# dsh-better-sidebar bundle patch
- insert:
    - id: better-sidebar
      name: 'dsh-better-sidebar'
      disabled: !!js "[...ctx.loader.entries()].some(...)"
`
const AT_FILE_PATCH = `- insert:
    - id: dsh-at-file
      name: dsh-at-file
`
const MODLENS_PATCH = `# dsh bundle layer: mount the modlens vision plugin
- insert:
    - id: modlens
      name: '@liustack/modlens'
`
const INLINE_PATCH = `- insert: [{ id: inline-p, name: inline-plugin }]
`

test('findEntryIds 提取真实 bundle 的装载条目 id', () => {
  assert.deepEqual(findEntryIds(BETTER_SIDEBAR_PATCH, 'dsh-better-sidebar'), ['better-sidebar'])
  assert.deepEqual(findEntryIds(AT_FILE_PATCH, 'dsh-at-file'), ['dsh-at-file'])
  assert.deepEqual(findEntryIds(MODLENS_PATCH, '@liustack/modlens'), ['modlens'])
  assert.deepEqual(findEntryIds(INLINE_PATCH, 'inline-plugin'), ['inline-p'])
  assert.deepEqual(findEntryIds(AT_FILE_PATCH, 'not-present'), [])
  assert.deepEqual(findEntryIds('', 'x'), [])
})

// ---- GitHub URL 提取 ----
test('githubUrlFromSpec 处理 github: 前缀与 owner/repo 简写', () => {
  assert.equal(githubUrlFromSpec('github:omdsh-dev/DSH-better-sidebar#main'), 'https://github.com/omdsh-dev/DSH-better-sidebar')
  assert.equal(githubUrlFromSpec('github:omdsh-dev/dsh-at-file#main'), 'https://github.com/omdsh-dev/dsh-at-file')
  assert.equal(githubUrlFromSpec('^0.1.9'), undefined)
  assert.equal(githubUrlFromSpec('3.17.2'), undefined)
  // 作用域 npm 包不应被误判为 github 简写
  assert.equal(githubUrlFromSpec('@liustack/modlens@3.17.2'), undefined)
  assert.equal(githubUrlFromSpec(null), undefined)
})

test('githubUrlFromRepo 归一化 repository 字段', () => {
  assert.equal(githubUrlFromRepo('https://github.com/omdsh-dev/dsh-at-file'), 'https://github.com/omdsh-dev/dsh-at-file')
  assert.equal(githubUrlFromRepo('git+https://github.com/omdsh-dev/dsh-at-file.git'), 'https://github.com/omdsh-dev/dsh-at-file')
  assert.equal(githubUrlFromRepo({ url: 'https://github.com/liustack/modlens' }), undefined) // 传对象不匹配
  assert.equal(githubUrlFromRepo(null), undefined)
})

test('specSource 判定依赖来源', () => {
  assert.equal(specSource('github:omdsh-dev/dsh-at-file#main'), 'github')
  assert.equal(specSource('^0.1.9'), 'npm')
  assert.equal(specSource('file:../x'), 'local')
  assert.equal(specSource(null), 'unknown')
})

// ---- patch 停用/启用文本操作 ----
test('patchWithStop 在空模板上追加停用条目', () => {
  const next = patchWithStop(TEMPLATE, stopAddition('dsh-at-file', ['dsh-at-file']))
  assert.ok(next.includes(`# ${MARKER}: stop dsh-at-file`))
  assert.ok(next.includes('- id: dsh-at-file'))
  assert.ok(next.includes("  name: 'dsh-at-file'"))
  assert.ok(next.includes('  disabled: true'))
})

test('patchWithoutStop 移除停用条目并还原空模板', () => {
  const stopped = patchWithStop(TEMPLATE, stopAddition('dsh-at-file', ['dsh-at-file']))
  assert.equal(patchWithoutStop(stopped, 'dsh-at-file'), '[]\n')
})

test('多次停用不同插件后再移除其中一个', () => {
  let p = patchWithStop(TEMPLATE, stopAddition('dsh-at-file', ['dsh-at-file']))
  p = patchWithStop(p, stopAddition('dsh-better-sidebar', ['better-sidebar']))
  const removed = patchWithoutStop(p, 'dsh-at-file')
  assert.ok(!patchHasStop(removed, 'dsh-at-file'))
  assert.ok(patchHasStop(removed, 'dsh-better-sidebar'))
  assert.ok(removed.includes('better-sidebar'))
})

test('stopAddition 对多 id 插件生成多条目', () => {
  const addition = stopAddition('multi', ['a', 'b'])
  assert.equal((addition.match(/# dsh-plugin-manager: stop multi/g) || []).length, 2)
})

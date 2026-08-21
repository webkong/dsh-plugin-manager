// profile cordis.patch.yml 的停用/启用/装载文本操作。
// 停用一个 bundle = 追加 { id, name, disabled: true }（id-targeted patch，对 reconcile 免疫）。
// 装载一个非 bundle 已安装插件 = 追加 - insert: 条目（bundle 插件走 bundles 列表，见 manager.start）。
import { MARKER } from './constants.ts'

// 追加一段 YAML 到 patch 文件（处理空文件与占位 '[]'）
export function patchAppend(patchText: string, addition: string): string {
  const lines = patchText.split('\n')
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  if (lines.length && lines[lines.length - 1].trim() === '[]') lines.pop()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  const base = lines.join('\n')
  const add = addition.trimEnd() + '\n'
  return base.length ? base + '\n' + add : add
}

export function patchWithStop(patchText: string, addition: string): string {
  return patchAppend(patchText, addition)
}

// 按 marker 注释行定位并整块删除（连同其后缩进/列表子行）
function patchWithoutBlock(patchText: string, marker: string): string {
  const lines = patchText.split('\n')
  const out: string[] = []
  let skipping = false
  for (const line of lines) {
    if (line.startsWith(marker)) {
      skipping = true
      continue
    }
    if (skipping) {
      if (/^-\s/.test(line) || /^\s{2,}/.test(line)) continue
      skipping = false
    }
    out.push(line)
  }
  const result = out.join('\n')
  const meaningful = result.split('\n').filter((l) => {
    const t = l.trim()
    return t && !t.startsWith('#')
  })
  return meaningful.length ? result : '[]\n'
}

export function patchHasStop(patchText: string, name: string): boolean {
  return patchText.indexOf('# ' + MARKER + ': stop ' + name) !== -1
}

export function patchWithoutStop(patchText: string, name: string): string {
  return patchWithoutBlock(patchText, '# ' + MARKER + ': stop ' + name)
}

export function patchHasLoad(patchText: string, name: string): boolean {
  return patchText.indexOf('# ' + MARKER + ': load ' + name) !== -1
}

export function patchWithoutLoad(patchText: string, name: string): string {
  return patchWithoutBlock(patchText, '# ' + MARKER + ': load ' + name)
}

export function stopAddition(name: string, ids: readonly string[]): string {
  const q = (s: string) => "'" + String(s).replace(/'/g, "'\\''") + "'"
  return ids
    .map((id) => '# ' + MARKER + ': stop ' + name + ' (auto-managed)\n- id: ' + id + '\n  name: ' + q(name) + '\n  disabled: true\n')
    .join('\n')
}

// 装载非 bundle 插件的 insert 条目（entryId 由调用方生成，见 manager.start 的 pmgr- 前缀规则）
export function loadAddition(name: string, entryId: string): string {
  const q = (s: string) => "'" + String(s).replace(/'/g, "'\\''") + "'"
  return '# ' + MARKER + ': load ' + name + ' (auto-managed)\n- insert:\n    - id: ' + entryId + '\n      name: ' + q(name) + '\n'
}

// profile cordis.patch.yml 的停用/启用文本操作。
// 停用一个 bundle = 追加 { id, name, disabled: true }（id-targeted patch，对 reconcile 免疫）。
import { MARKER } from './constants.js'

export function patchHasStop(patchText, name) {
  return patchText.indexOf('# ' + MARKER + ': stop ' + name) !== -1
}

export function patchWithStop(patchText, addition) {
  const lines = patchText.split('\n')
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  if (lines.length && lines[lines.length - 1].trim() === '[]') lines.pop()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  const base = lines.join('\n')
  const add = addition.trimEnd() + '\n'
  return base.length ? base + '\n' + add : add
}

export function patchWithoutStop(patchText, name) {
  const marker = '# ' + MARKER + ': stop ' + name
  const lines = patchText.split('\n')
  const out = []
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

export function stopAddition(name, ids) {
  const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'"
  return ids
    .map((id) => '# ' + MARKER + ': stop ' + name + ' (auto-managed)\n- id: ' + id + '\n  name: ' + q(name) + '\n  disabled: true\n')
    .join('\n')
}

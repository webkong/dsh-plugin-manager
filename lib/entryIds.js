// 从 bundle 的 cordis.patch.yml 提取 name 等于包名的装载条目 id（用于停用/启用 patch 定位）
export function findEntryIds(yamlText, packageName) {
  const ids = []
  if (!yamlText) return ids
  const lines = yamlText.split('\n')
  const items = []
  let cur = null
  for (const line of lines) {
    if (/^-\s/.test(line) || line.trim() === '-') {
      if (cur) items.push(cur)
      cur = [line]
    } else if (cur) {
      cur.push(line)
    }
  }
  if (cur) items.push(cur)
  for (const item of items) {
    const head = (item[0] || '').trim()
    const inline = head.match(/insert:\s*\[/)
    if (!/^- insert:/.test(head) && !inline) continue
    if (inline) {
      const text = item.join(' ')
      const re = /\{\s*id:\s*['"]?([^'"},\s]+)['"]?[^}]*?name:\s*['"]?([^'"},\s]+)['"]?[^}]*?\}/g
      let m
      while ((m = re.exec(text))) {
        if (m[2] === packageName && !ids.includes(m[1])) ids.push(m[1])
      }
      continue
    }
    const entryBlocks = []
    let ecur = null
    for (const line of item.slice(1)) {
      if (/^\s+-\s/.test(line)) {
        if (ecur) entryBlocks.push(ecur)
        ecur = [line]
      } else if (ecur) {
        ecur.push(line)
      }
    }
    if (ecur) entryBlocks.push(ecur)
    for (const block of entryBlocks) {
      const text = block.join('\n')
      const idM = text.match(/^\s*-\s*id:\s*['"]?([^'"\s]+)['"]?\s*$/m)
      const nameM = text.match(/^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/m)
      const id = idM ? idM[1] : null
      const name = nameM ? nameM[1] : null
      if (id && (name === packageName || id === packageName) && !ids.includes(id)) ids.push(id)
    }
  }
  return ids
}

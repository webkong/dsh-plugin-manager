// src/host/constants.ts
var MARKER = "dsh-plugin-manager";

// src/host/patch.ts
function patchAppend(patchText, addition) {
  const lines = patchText.split("\n");
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length && lines[lines.length - 1].trim() === "[]") lines.pop();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const base = lines.join("\n");
  const add = addition.trimEnd() + "\n";
  return base.length ? base + "\n" + add : add;
}
function patchWithStop(patchText, addition) {
  return patchAppend(patchText, addition);
}
function patchWithoutBlock(patchText, marker) {
  const lines = patchText.split("\n");
  const out = [];
  let skipping = false;
  for (const line of lines) {
    if (line.startsWith(marker)) {
      skipping = true;
      continue;
    }
    if (skipping) {
      if (/^-\s/.test(line) || /^\s{2,}/.test(line)) continue;
      skipping = false;
    }
    out.push(line);
  }
  const result = out.join("\n");
  const meaningful = result.split("\n").filter((l) => {
    const t = l.trim();
    return t && !t.startsWith("#");
  });
  return meaningful.length ? result : "[]\n";
}
function patchHasStop(patchText, name) {
  return patchText.indexOf("# " + MARKER + ": stop " + name) !== -1;
}
function patchWithoutStop(patchText, name) {
  return patchWithoutBlock(patchText, "# " + MARKER + ": stop " + name);
}
function patchHasLoad(patchText, name) {
  return patchText.indexOf("# " + MARKER + ": load " + name) !== -1;
}
function patchWithoutLoad(patchText, name) {
  return patchWithoutBlock(patchText, "# " + MARKER + ": load " + name);
}
function stopAddition(name, ids) {
  const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
  return ids.map((id) => "# " + MARKER + ": stop " + name + " (auto-managed)\n- id: " + id + "\n  name: " + q(name) + "\n  disabled: true\n").join("\n");
}
function loadAddition(name, entryId) {
  const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
  return "# " + MARKER + ": load " + name + " (auto-managed)\n- insert:\n    - id: " + entryId + "\n      name: " + q(name) + "\n";
}
export {
  loadAddition,
  patchAppend,
  patchHasLoad,
  patchHasStop,
  patchWithStop,
  patchWithoutLoad,
  patchWithoutStop,
  stopAddition
};

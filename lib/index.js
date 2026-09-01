// src/host/constants.ts
var NAME = "@webkong/dsh-plugin-manager";
var ROUTE_PREFIX = "/pmgr";
var MARKER = "dsh-plugin-manager";
var DEFAULT_PROFILE = "web";

// src/host/http.ts
function isLoopback(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1" || address === "localhost";
}
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(payload);
}
function sendError(res, status, message, details) {
  sendJson(res, status, { ok: false, error: message, ...details === void 0 ? {} : { details } });
}
async function readBody(req, maxBytes = 64 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) throw new Error("\u8BF7\u6C42\u4F53\u8FC7\u5927");
    chunks.push(buf);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("\u8BF7\u6C42\u4F53\u4E0D\u662F\u5408\u6CD5 JSON");
  }
}

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

// src/host/manager.ts
import { writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join as join3 } from "node:path";

// src/host/resolve.ts
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
function resolvePackageDirs(names, profileDir, installPkgDir) {
  if (!names || !names.length) return {};
  const bases = [profileDir];
  if (installPkgDir) bases.push(installPkgDir);
  const resolvers = bases.map((base) => createRequire(join(base, "package.json")));
  const out = {};
  for (const n of names) {
    let found = null;
    for (const req of resolvers) {
      try {
        found = req.resolve(n + "/package.json");
        break;
      } catch {
      }
    }
    out[n] = found ? found.replace(/\/package\.json$/, "") : null;
  }
  return out;
}
function readPackageMetas(dirs) {
  const out = {};
  for (const [name2, dir] of Object.entries(dirs)) {
    if (!dir) continue;
    try {
      const p = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      const repo = p.repository;
      out[name2] = {
        version: typeof p.version === "string" ? p.version : null,
        description: typeof p.description === "string" ? p.description : null,
        homepage: typeof p.homepage === "string" ? p.homepage : null,
        repository: typeof repo === "string" ? repo : repo && typeof repo === "object" && typeof repo.url === "string" ? repo.url : null,
        bundlePatch: p.dsh && typeof p.dsh === "object" && p.dsh.bundle && typeof p.dsh.bundle.patch === "string" ? p.dsh.bundle.patch : null
      };
    } catch {
      out[name2] = null;
    }
  }
  return out;
}

// src/host/entryIds.ts
function findEntryIds(yamlText, packageName) {
  const ids = [];
  if (!yamlText) return ids;
  const lines = yamlText.split("\n");
  const items = [];
  let cur = null;
  for (const line of lines) {
    if (/^-\s/.test(line) || line.trim() === "-") {
      if (cur) items.push(cur);
      cur = [line];
    } else if (cur) {
      cur.push(line);
    }
  }
  if (cur) items.push(cur);
  for (const item of items) {
    const head = (item[0] || "").trim();
    const inline = head.match(/insert:\s*\[/);
    if (!/^- insert:/.test(head) && !inline) continue;
    if (inline) {
      const text = item.join(" ");
      const re = /\{\s*id:\s*['"]?([^'"},\s]+)['"]?[^}]*?name:\s*['"]?([^'"},\s]+)['"]?[^}]*?\}/g;
      let m;
      while (m = re.exec(text)) {
        if (m[2] === packageName && !ids.includes(m[1])) ids.push(m[1]);
      }
      continue;
    }
    const entryBlocks = [];
    let ecur = null;
    for (const line of item.slice(1)) {
      if (/^\s+-\s/.test(line)) {
        if (ecur) entryBlocks.push(ecur);
        ecur = [line];
      } else if (ecur) {
        ecur.push(line);
      }
    }
    if (ecur) entryBlocks.push(ecur);
    for (const block of entryBlocks) {
      const text = block.join("\n");
      const idM = text.match(/^\s*-\s*id:\s*['"]?([^'"\s]+)['"]?\s*$/m);
      const nameM = text.match(/^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/m);
      const id = idM ? idM[1] : null;
      const name2 = nameM ? nameM[1] : null;
      if (id && (name2 === packageName || id === packageName) && !ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

// src/host/github.ts
import { readFileSync as readFileSync2, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join as join2 } from "node:path";
function githubUrlFromSpec(spec) {
  if (!spec) return void 0;
  const s = String(spec).trim();
  let m = s.match(/^github:([^#@]+)/);
  if (m) return "https://github.com/" + m[1].replace(/^\/+|\/+$/g, "");
  m = s.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:[#@]|$)/);
  if (m && !s.startsWith("@")) return "https://github.com/" + m[1];
  return void 0;
}
function githubUrlFromRepo(repo) {
  if (!repo) return void 0;
  const s = String(repo);
  let m = s.match(/https?:\/\/github\.com\/[^\s'"#]+/);
  if (m) return m[0].replace(/\.git(\/.*)?$/, "").replace(/\/+$/, "");
  m = s.match(/git@github\.com:([^\s'"]+)/);
  if (m) return "https://github.com/" + m[1].replace(/\.git$/, "");
  return void 0;
}
function specSource(spec) {
  if (!spec) return "unknown";
  const s = String(spec);
  if (/^github:/.test(s) || /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:[#@]|$)/.test(s)) return "github";
  if (/^(file|link|workspace):/.test(s)) return "local";
  return "npm";
}
function loadGithubToken() {
  const env = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (env && env.trim()) return env.trim();
  try {
    const home = homedir();
    const gh = join2(home, ".config", "gh", "hosts.yml");
    if (existsSync(gh)) {
      const m = readFileSync2(gh, "utf8").match(/oauth_token:\s*([^\s]+)/);
      if (m && m[1]) return m[1];
    }
    for (const f of [".zshrc", ".zprofile", ".bashrc", ".bash_profile", ".profile"]) {
      const p = join2(home, f);
      if (!existsSync(p)) continue;
      const m = readFileSync2(p, "utf8").match(/export\s+(?:GH_TOKEN|GITHUB_TOKEN)\s*=\s*["']?([^"'\s]+)/);
      if (m && m[1]) return m[1];
    }
    const gc = join2(home, ".gitconfig");
    if (existsSync(gc)) {
      const m = readFileSync2(gc, "utf8").match(/\[github\][\s\S]*?token\s*=\s*([^\s]+)/);
      if (m && m[1]) return m[1];
    }
  } catch {
  }
  return null;
}

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
function patchHasStop(patchText, name2) {
  return patchText.indexOf("# " + MARKER + ": stop " + name2) !== -1;
}
function patchWithoutStop(patchText, name2) {
  return patchWithoutBlock(patchText, "# " + MARKER + ": stop " + name2);
}
function patchHasLoad(patchText, name2) {
  return patchText.indexOf("# " + MARKER + ": load " + name2) !== -1;
}
function patchWithoutLoad(patchText, name2) {
  return patchWithoutBlock(patchText, "# " + MARKER + ": load " + name2);
}
function stopAddition(name2, ids) {
  const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
  return ids.map((id) => "# " + MARKER + ": stop " + name2 + " (auto-managed)\n- id: " + id + "\n  name: " + q(name2) + "\n  disabled: true\n").join("\n");
}
function loadAddition(name2, entryId) {
  const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
  return "# " + MARKER + ": load " + name2 + " (auto-managed)\n- insert:\n    - id: " + entryId + "\n      name: " + q(name2) + "\n";
}

// src/host/manager.ts
function createManager(ctx, profile, fsTools) {
  const { readText: readText2, writeText: writeText2, readManifest: readManifest2, updateManifest: updateManifest2, execBash: execBash2, profilePath: profilePath2, findDshPkgDir: findDshPkgDir2, dshHome: dshHome2, readSettings: readSettings2, writeSettings: writeSettings2 } = fsTools;
  const inventoryOf = () => ctx.get("pluginInventory");
  const loaderOf = () => ctx.get("loader");
  async function scheduleRestart(force = false) {
    if (!force) {
      const settings = await readSettings2();
      if (!settings.autoRestart) return false;
    }
    try {
      const pid = process.pid;
      const script = [
        "#!/bin/bash",
        "sleep 1",
        `kill ${pid} 2>/dev/null`,
        `for i in $(seq 1 30); do kill -0 ${pid} 2>/dev/null || break; sleep 1; done`,
        `kill -9 ${pid} 2>/dev/null`,
        "sleep 1",
        "nohup dsh web >> /tmp/dsh-web-auto-restart.log 2>&1 < /dev/null &",
        "sleep 5",
        "curl -s -o /dev/null http://127.0.0.1:3080",
        'echo "[$(date)] auto-restart completed" >> /tmp/dsh-web-auto-restart.log'
      ].join("\n");
      const scriptPath = join3(tmpdir(), "dsh-pmgr-restart-" + pid + ".sh");
      writeFileSync(scriptPath, script, "utf8");
      const child = spawn("/bin/bash", [scriptPath], { detached: true, stdio: "ignore" });
      child.unref();
      return true;
    } catch (e) {
      console.log("dsh-plugin-manager: auto-restart failed", String(e));
      return false;
    }
  }
  function shellQuote(s) {
    return "'" + String(s).replace(/'/g, "'\\''") + "'";
  }
  function tail(text, max) {
    if (!text) return "";
    return text.length > max ? "\u2026" + text.slice(-max) : text;
  }
  function includePrefix() {
    const loader = loaderOf();
    if (!loader) return "";
    for (const entry of loader.entries()) {
      if (entry.options && entry.options.name === "cordis:include") return `${entry.id}:`;
    }
    return "";
  }
  function rowIdOf(entryId) {
    const prefix = includePrefix();
    if (prefix.length > 0 && entryId.startsWith(prefix)) return entryId.slice(prefix.length);
    return entryId;
  }
  async function readInventoryRows() {
    const acc = /* @__PURE__ */ new Map();
    const inventory = inventoryOf();
    if (!inventory || typeof inventory.list !== "function") return /* @__PURE__ */ new Map();
    const rowOf = (name2) => {
      const existing = acc.get(name2);
      if (existing) return existing;
      const created = { entryIds: [], loaderEnabled: null, presetEnabled: null, fiberPhase: null, presets: [] };
      acc.set(name2, created);
      return created;
    };
    try {
      const snapshot = await inventory.list();
      if (!snapshot) return /* @__PURE__ */ new Map();
      if (Array.isArray(snapshot.entries)) {
        for (const e of snapshot.entries) {
          const nm = e.moduleName;
          if (!nm) continue;
          const rec = rowOf(nm);
          rec.entryIds.push(rowIdOf(e.entryId));
          rec.loaderEnabled = (rec.loaderEnabled ?? true) && e.enabled !== false;
          if (e.fiberPhase) rec.fiberPhase = e.fiberPhase;
        }
      }
      if (Array.isArray(snapshot.agentPresets)) {
        for (const group of snapshot.agentPresets) {
          const presetId = typeof group.id === "string" ? group.id : "";
          if (!presetId || !Array.isArray(group.rows)) continue;
          for (const row of group.rows) {
            const nm = row.moduleName;
            if (!nm) continue;
            const rec = rowOf(nm);
            if (rec.presets.indexOf(presetId) === -1) rec.presets.push(presetId);
            if (row.enabled !== false) rec.presetEnabled = true;
            else if (rec.presetEnabled === null) rec.presetEnabled = false;
            if (row.fiberPhase && !rec.fiberPhase) rec.fiberPhase = row.fiberPhase;
          }
        }
      }
    } catch {
    }
    const byName = /* @__PURE__ */ new Map();
    for (const [name2, rec] of acc) {
      const enabled = rec.loaderEnabled === true || rec.presetEnabled === true || rec.loaderEnabled === null && rec.presetEnabled === null;
      byName.set(name2, { entryIds: rec.entryIds, enabled, fiberPhase: rec.fiberPhase, presets: rec.presets });
    }
    return byName;
  }
  async function list() {
    const dir = profilePath2(profile);
    const manifest = await readManifest2(dir);
    if (!manifest) {
      return { ok: false, message: "profile \u76EE\u5F55\u4E0D\u5B58\u5728\u6216 manifest \u65E0\u6CD5\u89E3\u6790: " + dir };
    }
    const patchText = await readText2(dir + "/cordis.patch.yml");
    const dsh = manifest.dsh && typeof manifest.dsh === "object" ? manifest.dsh : {};
    const profileObj = dsh.profile && typeof dsh.profile === "object" ? dsh.profile : {};
    const bundles = Array.isArray(profileObj.bundles) ? profileObj.bundles.filter((b) => typeof b === "string") : [];
    const deps = manifest.dependencies && typeof manifest.dependencies === "object" ? manifest.dependencies : {};
    const inventoryRows = await readInventoryRows();
    const installPkgDir = findDshPkgDir2();
    const names = [];
    const seen = /* @__PURE__ */ new Set();
    for (const n of inventoryRows.keys()) {
      if (!seen.has(n)) {
        seen.add(n);
        names.push(n);
      }
    }
    for (const n of bundles) {
      if (!seen.has(n)) {
        seen.add(n);
        names.push(n);
      }
    }
    for (const n of Object.keys(deps)) {
      if (!seen.has(n)) {
        seen.add(n);
        names.push(n);
      }
    }
    const dirs = resolvePackageDirs(names, dir, installPkgDir);
    const metas = readPackageMetas(dirs);
    const plugins = [];
    for (const nm of names) {
      const pkgDir = dirs[nm];
      const meta = metas[nm];
      const spec = deps[nm] !== void 0 && deps[nm] !== null ? String(deps[nm]) : null;
      const inv = inventoryRows.get(nm);
      const installed = !!pkgDir;
      const isBundle = !!(meta && meta.bundlePatch);
      const mounted = !!inv;
      const disabledByManager = patchHasStop(patchText, nm);
      const disabled = disabledByManager || (inv ? !inv.enabled : false);
      const kind = Object.prototype.hasOwnProperty.call(deps, nm) ? "third-party" : "builtin";
      let entryIds = inv ? [...inv.entryIds] : [];
      if (kind === "third-party" && entryIds.length === 0 && meta && meta.bundlePatch && pkgDir) {
        const patchYaml = await readText2(pkgDir + "/" + meta.bundlePatch);
        entryIds = findEntryIds(patchYaml, nm);
      }
      const ghFromSpec = githubUrlFromSpec(spec);
      const ghFromRepo = meta ? githubUrlFromRepo(meta.repository) : void 0;
      let githubUrl = ghFromSpec || ghFromRepo;
      if (!githubUrl && meta && meta.homepage && /github\.com/.test(meta.homepage)) {
        githubUrl = githubUrlFromRepo(meta.homepage);
      }
      plugins.push({
        name: nm,
        version: meta ? meta.version : null,
        description: meta ? meta.description : null,
        kind,
        source: specSource(spec),
        spec,
        installed,
        installDir: pkgDir || null,
        inBundles: bundles.indexOf(nm) !== -1,
        isBundle,
        mounted,
        disabled,
        disabledByManager,
        enabled: mounted && !disabled,
        missing: !installed,
        runtime: inv ? { enabled: inv.enabled, fiberPhase: inv.fiberPhase } : null,
        entryIds,
        presets: inv ? [...inv.presets] : [],
        githubUrl: githubUrl || null,
        homepage: meta ? meta.homepage : null
      });
    }
    plugins.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "builtin" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return {
      ok: true,
      profile,
      profileDir: dir,
      dshHome: dir.slice(0, dir.length - ("/profiles/" + profile).length),
      settings: await readSettings2(),
      counts: {
        total: plugins.length,
        builtin: plugins.filter((p) => p.kind === "builtin").length,
        thirdParty: plugins.filter((p) => p.kind === "third-party").length,
        disabled: plugins.filter((p) => p.disabled).length
      },
      plugins
    };
  }
  async function install(spec) {
    if (!spec || !String(spec).trim()) return { ok: false, message: "\u7F3A\u5C11\u63D2\u4EF6\u6807\u8BC6" };
    const clean = String(spec).trim();
    const res = await execBash2("dsh plugin --profile " + profile + " add " + shellQuote(clean), 3e5);
    const out = ((res.stdout || "") + "\n" + (res.stderr || "")).trim();
    if (res.exitCode === 0) {
      const restarted = await scheduleRestart();
      return {
        ok: true,
        message: restarted ? "\u5DF2\u5B89\u88C5 " + clean + "\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u542F dsh web\uFF08\u7EA6 10 \u79D2\u540E\u5237\u65B0\u9875\u9762\u751F\u6548\uFF09" : "\u5DF2\u5B89\u88C5 " + clean + "\uFF08\u82E5\u58F0\u660E\u4E86 dsh.bundle \u5DF2\u81EA\u52A8\u52A0\u5165\u88C5\u8F7D\u5217\u8868\uFF1B\u91CD\u542F\u540E\u751F\u6548\uFF09",
        restarting: restarted,
        output: tail(out, 1500)
      };
    }
    return { ok: false, message: "\u5B89\u88C5\u5931\u8D25\uFF08\u9000\u51FA\u7801 " + res.exitCode + "\uFF09", output: tail(out, 2e3) };
  }
  async function uninstall(name2) {
    if (!name2) return { ok: false, message: "\u7F3A\u5C11\u63D2\u4EF6\u540D" };
    const dir = profilePath2(profile);
    const res = await execBash2("dsh plugin --profile " + profile + " remove " + shellQuote(name2), 3e5);
    const out = ((res.stdout || "") + "\n" + (res.stderr || "")).trim();
    if (res.exitCode !== 0) {
      return { ok: false, message: "\u5378\u8F7D\u5931\u8D25\uFF08\u9000\u51FA\u7801 " + res.exitCode + "\uFF09", output: tail(out, 2e3) };
    }
    const patchText = await readText2(dir + "/cordis.patch.yml");
    let cleaned = patchWithoutStop(patchText, name2);
    if (patchHasLoad(cleaned, name2)) cleaned = patchWithoutLoad(cleaned, name2);
    if (cleaned !== patchText) await writeText2(dir + "/cordis.patch.yml", cleaned);
    const restarted = await scheduleRestart();
    return {
      ok: true,
      message: restarted ? "\u5DF2\u5378\u8F7D " + name2 + "\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u542F dsh web\uFF08\u7EA6 10 \u79D2\u540E\u5237\u65B0\u9875\u9762\u751F\u6548\uFF09" : "\u5DF2\u5378\u8F7D " + name2 + "\uFF08\u91CD\u542F\u540E\u4E0D\u518D\u88C5\u8F7D\uFF09",
      restarting: restarted,
      output: tail(out, 1500)
    };
  }
  async function stop(name2) {
    const dir = profilePath2(profile);
    const listRes = await list();
    const plugin = listRes.plugins && listRes.plugins.find((p) => p.name === name2);
    if (!plugin) return { ok: false, message: "\u672A\u627E\u5230\u63D2\u4EF6 " + name2 };
    if (plugin.kind === "builtin") return { ok: false, message: "\u5185\u7F6E\u63D2\u4EF6\u4E0D\u53EF\u505C\u7528\uFF08\u5C5E\u4E8E DSH \u53D1\u884C\u7248\uFF09" };
    if (!plugin.mounted) return { ok: false, message: name2 + " \u672A\u5728\u88C5\u8F7D\u72B6\u6001" };
    const patchText = await readText2(dir + "/cordis.patch.yml");
    if (patchHasStop(patchText, name2)) {
      return { ok: true, message: name2 + " \u5DF2\u5904\u4E8E\u505C\u7528\u72B6\u6001\uFF08\u91CD\u542F\u540E\u751F\u6548\uFF09" };
    }
    if (plugin.entryIds && plugin.entryIds.length) {
      const addition = stopAddition(name2, plugin.entryIds);
      const next = patchWithStop(patchText, addition);
      const ok = await writeText2(dir + "/cordis.patch.yml", next);
      return ok ? { ok: true, message: "\u5DF2\u505C\u7528 " + name2 + "\uFF08\u5DF2\u5199\u5165 profile \u7684 cordis.patch.yml\uFF1B\u91CD\u542F\u540E\u751F\u6548\uFF09" } : { ok: false, message: "\u5199\u5165 cordis.patch.yml \u5931\u8D25" };
    }
    const patchText2 = await readText2(dir + "/cordis.patch.yml");
    if (patchHasLoad(patchText2, name2)) {
      const cleaned = patchWithoutLoad(patchText2, name2);
      const ok = await writeText2(dir + "/cordis.patch.yml", cleaned);
      return ok ? { ok: true, message: "\u5DF2\u505C\u7528 " + name2 + "\uFF08\u5DF2\u4ECE profile patch \u79FB\u9664\u88C5\u8F7D\u6761\u76EE\uFF1B\u91CD\u542F\u540E\u751F\u6548\uFF09" } : { ok: false, message: "\u5199\u5165 cordis.patch.yml \u5931\u8D25" };
    }
    if (plugin.presets.length && !plugin.inBundles) {
      return {
        ok: false,
        message: name2 + " \u7531 agent preset \u7EC4\u5408\u88C5\u8F7D\uFF08" + plugin.presets.join("\u3001") + "\uFF09\uFF0C\u8BF7\u5728\u5BF9\u5E94\u9884\u8BBE\u7684 cordis.yml \u4E2D\u79FB\u9664\u8BE5\u884C\uFF1Bprofile \u7684 bundles/patch \u4E0D\u5F71\u54CD\u5B83"
      };
    }
    const mres = await updateManifest2(dir, (m) => {
      const mDsh = m.dsh && typeof m.dsh === "object" ? m.dsh : {};
      const mProfile = mDsh.profile && typeof mDsh.profile === "object" ? mDsh.profile : {};
      const bundles = Array.isArray(mProfile.bundles) ? mProfile.bundles.filter((b) => typeof b === "string") : [];
      mProfile.bundles = bundles.filter((b) => b !== name2);
    });
    return {
      ok: mres.ok,
      message: mres.ok ? "\u5DF2\u505C\u7528 " + name2 + "\uFF08\u672A\u80FD\u5B9A\u4F4D patch \u6761\u76EE\uFF0C\u6539\u4E3A\u4ECE bundles \u5217\u8868\u79FB\u9664\uFF1B\u91CD\u542F\u540E\u751F\u6548\uFF09" : mres.message
    };
  }
  async function start(name2) {
    const dir = profilePath2(profile);
    const listRes = await list();
    const plugin = listRes.plugins && listRes.plugins.find((p) => p.name === name2);
    if (!plugin) return { ok: false, message: "\u672A\u627E\u5230\u63D2\u4EF6 " + name2 };
    const patchText = await readText2(dir + "/cordis.patch.yml");
    let message = null;
    if (patchHasStop(patchText, name2)) {
      const cleaned = patchWithoutStop(patchText, name2);
      const ok = await writeText2(dir + "/cordis.patch.yml", cleaned);
      if (!ok) return { ok: false, message: "\u5199\u5165 cordis.patch.yml \u5931\u8D25" };
      message = "\u5DF2\u542F\u7528 " + name2 + "\uFF08\u5DF2\u4ECE profile patch \u79FB\u9664\u505C\u7528\u6761\u76EE\uFF1B\u91CD\u542F\u540E\u751F\u6548\uFF09";
    }
    if (!plugin.inBundles && plugin.isBundle && plugin.installed) {
      const mres = await updateManifest2(dir, (m) => {
        const mDsh = m.dsh && typeof m.dsh === "object" ? m.dsh : {};
        const mProfile = mDsh.profile && typeof mDsh.profile === "object" ? mDsh.profile : {};
        if (!Array.isArray(mProfile.bundles)) mProfile.bundles = [];
        const list2 = mProfile.bundles;
        if (list2.indexOf(name2) === -1) list2.push(name2);
      });
      if (!mres.ok) return mres;
      message = message || "\u5DF2\u52A0\u5165\u88C5\u8F7D\u5217\u8868\uFF1A" + name2 + "\uFF08\u91CD\u542F\u540E\u751F\u6548\uFF09";
    }
    if (!plugin.isBundle && plugin.installed && !plugin.mounted) {
      const current = await readText2(dir + "/cordis.patch.yml");
      if (!patchHasLoad(current, name2)) {
        const entryId = "pmgr-" + String(name2).replace(/^@[^/]+\//, "").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
        const next = patchAppend(current, loadAddition(name2, entryId));
        const ok = await writeText2(dir + "/cordis.patch.yml", next);
        if (!ok) return { ok: false, message: "\u5199\u5165 cordis.patch.yml \u5931\u8D25" };
        message = message || "\u5DF2\u88C5\u8F7D " + name2 + "\uFF08\u5DF2\u5199\u5165 profile \u7684 cordis.patch.yml\uFF1B\u91CD\u542F\u540E\u751F\u6548\uFF09";
      } else {
        message = message || "\u5DF2\u88C5\u8F7D " + name2 + "\uFF08\u91CD\u542F\u540E\u751F\u6548\uFF09";
      }
    }
    return { ok: true, message: message || name2 + " \u672A\u5904\u4E8E\u505C\u7528\u72B6\u6001" };
  }
  async function githubSearch(q) {
    const url = "https://api.github.com/search/repositories?q=" + encodeURIComponent(q) + "&sort=stars&order=desc&per_page=20";
    const headers = { "User-Agent": "dsh-plugin-manager", Accept: "application/vnd.github+json" };
    const token = loadGithubToken();
    const noToken = !token;
    if (token) headers.Authorization = "Bearer " + token;
    try {
      const res = await fetch(url, { headers });
      if (res.status === 403 || res.status === 429) {
        return {
          ok: false,
          rateLimited: true,
          noToken,
          message: "GitHub API \u89E6\u53D1\u9891\u7387\u9650\u5236\u3002\u53EF\u5168\u5C40\u914D\u7F6E token \u63D0\u9AD8\u9650\u989D\uFF1Aexport GH_TOKEN=xxx\uFF08\u6216\u8FD0\u884C gh auth login\uFF09\u540E\u91CD\u8BD5",
          items: []
        };
      }
      if (res.status === 401) {
        return { ok: false, noToken, message: "GitHub token \u65E0\u6548\u6216\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u68C0\u67E5 GH_TOKEN / gh auth login", items: [] };
      }
      if (!res.ok) return { ok: false, noToken, message: "GitHub \u641C\u7D22\u5931\u8D25 HTTP " + res.status, items: [] };
      const data = await res.json();
      const items = (data.items || []).map((r) => {
        const row = r;
        const owner = row.owner && typeof row.owner === "object" ? row.owner.login : "";
        return {
          fullName: String(row.full_name || ""),
          name: String(row.name || ""),
          description: String(row.description || ""),
          htmlUrl: String(row.html_url || ""),
          stars: Number(row.stargazers_count || 0),
          owner: typeof owner === "string" ? owner : "",
          defaultBranch: String(row.default_branch || "main")
        };
      });
      return { ok: true, noToken, items };
    } catch (e) {
      return { ok: false, noToken, message: "GitHub \u641C\u7D22\u5931\u8D25: " + String(e && e.message || e), items: [] };
    }
  }
  async function search(query) {
    const raw = typeof query === "string" ? query.trim() : "";
    const q = raw === "" ? "topic:dsh-plugin" : raw + " topic:dsh-plugin";
    const res = await githubSearch(q);
    return res.ok ? { ok: true, query: raw, items: res.items, noToken: res.noToken } : { ok: false, message: res.message, rateLimited: res.rateLimited, noToken: res.noToken };
  }
  async function resolve(name2) {
    const raw = typeof name2 === "string" ? name2.trim() : "";
    if (!raw) return { ok: false, message: "\u7F3A\u5C11\u63D2\u4EF6\u540D" };
    try {
      const npmRes = await fetch("https://registry.npmjs.org/" + encodeURIComponent(raw), { method: "HEAD" });
      if (npmRes.ok) return { ok: true, input: raw, type: "npm", spec: raw, candidates: [] };
    } catch {
    }
    let gh = await githubSearch(raw + " in:name topic:dsh-plugin");
    if (gh.ok && gh.items.length === 0) gh = await githubSearch(raw + " in:name");
    if (!gh.ok) return { ok: false, message: gh.message, rateLimited: gh.rateLimited, noToken: gh.noToken };
    if (gh.items.length === 0) return { ok: true, input: raw, type: "none", spec: null, candidates: [], noToken: gh.noToken };
    return { ok: true, input: raw, type: "github", spec: null, candidates: gh.items, noToken: gh.noToken };
  }
  async function setSettings(patch) {
    const current = await readSettings2();
    const next = { ...current, ...patch && typeof patch === "object" ? patch : {} };
    await writeSettings2(next);
    return { ok: true, settings: next };
  }
  async function restart() {
    const started = await scheduleRestart(true);
    return started ? { ok: true, restarting: true, message: "\u6B63\u5728\u81EA\u52A8\u91CD\u542F dsh web\uFF08\u7EA6 10 \u79D2\u540E\u5237\u65B0\u9875\u9762\u751F\u6548\uFF09" } : { ok: false, message: "\u65E0\u6CD5\u542F\u52A8\u81EA\u52A8\u91CD\u542F" };
  }
  return { list, install, uninstall, stop, start, setSettings, restart, search, resolve };
}

// src/host/fsutil.ts
import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync as existsSync2, realpathSync } from "node:fs";
import { execFile } from "node:child_process";
import { createRequire as createRequire2 } from "node:module";
import { join as join4 } from "node:path";
function dshHome() {
  return process.env.DSH_HOME || join4(process.env.HOME || "", ".dsh");
}
function profilePath(profile) {
  return join4(dshHome(), "profiles", profile);
}
async function readText(absPath) {
  try {
    return await readFile(absPath, "utf8");
  } catch {
    return "";
  }
}
async function writeText(absPath, content) {
  const tmp = absPath + ".pm-tmp";
  await writeFile(tmp, content, "utf8");
  await rename(tmp, absPath);
  return true;
}
async function readManifest(dir) {
  const text = await readText(join4(dir, "package.json"));
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("dsh-plugin-manager: manifest parse failed", String(e));
    return null;
  }
}
async function updateManifest(dir, mutate) {
  const manifest = await readManifest(dir);
  if (!manifest) return { ok: false, message: "\u65E0\u6CD5\u8BFB\u53D6 profile manifest" };
  try {
    mutate(manifest);
  } catch (e) {
    return { ok: false, message: String(e && e.message || e) };
  }
  try {
    await writeText(join4(dir, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
    return { ok: true, message: "\u5DF2\u66F4\u65B0 profile manifest" };
  } catch (e) {
    return { ok: false, message: "\u5199\u5165 profile manifest \u5931\u8D25: " + String(e && e.message || e) };
  }
}
function execBash(command, timeoutMs = 6e4) {
  return new Promise((resolve) => {
    execFile("/bin/bash", ["-c", command], { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && error.code === "ETIMEDOUT") {
        resolve({ exitCode: -1, stdout: String(stdout || ""), stderr: String(stderr || "") + "\n\u8D85\u65F6", timedOut: true });
        return;
      }
      resolve({
        exitCode: error ? typeof error.code === "number" ? error.code : 1 : 0,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
        timedOut: false
      });
    });
  });
}
function settingsPath() {
  return join4(dshHome(), "dsh-plugin-manager.json");
}
async function readSettings() {
  try {
    const raw = await readText(settingsPath());
    const parsed = raw.trim() ? JSON.parse(raw) : {};
    return { autoRestart: parsed.autoRestart === true };
  } catch {
    return { autoRestart: false };
  }
}
async function writeSettings(settings) {
  await writeText(settingsPath(), JSON.stringify(settings, null, 2) + "\n");
  return settings;
}
function findDshPkgDir() {
  try {
    const resolved = createRequire2(import.meta.url).resolve("@deepseek-ai/dsh/package.json");
    return resolved.replace(/\/package\.json$/, "");
  } catch {
  }
  const pathEnv = process.env.PATH || "";
  for (const dir of pathEnv.split(":")) {
    if (!dir) continue;
    const bin = join4(dir, "dsh");
    if (!existsSync2(bin)) continue;
    try {
      const real = realpathSync(bin);
      return real.split("/").slice(0, -2).join("/");
    } catch {
      return "";
    }
  }
  return "";
}

// src/host/handlers.ts
function createHandler(ctx, profile) {
  const fsTools = { readText, writeText, readManifest, updateManifest, execBash, profilePath, findDshPkgDir, dshHome, readSettings, writeSettings };
  const manager = createManager(ctx, profile, fsTools);
  return async (req, res) => {
    if (!isLoopback(req.socket?.remoteAddress ?? "")) {
      sendError(res, 403, "\u4EC5\u5141\u8BB8\u672C\u673A\u8BBF\u95EE");
      return;
    }
    try {
      const url = new URL(req.url ?? "/", "http://x");
      const pathname = url.pathname;
      const method = req.method ?? "GET";
      if (method === "GET" && pathname === "/pmgr/list") {
        sendJson(res, 200, await manager.list());
        return;
      }
      if (method !== "POST") {
        sendError(res, 405, "method not allowed");
        return;
      }
      const body = await readBody(req);
      const str = (v) => typeof v === "string" ? v : "";
      if (pathname === "/pmgr/install") {
        const spec = str(body.spec).trim();
        const check = validateSpec(spec);
        if (!check.ok) {
          sendError(res, 400, check.error);
          return;
        }
        sendJson(res, 200, await manager.install(spec));
      } else if (pathname === "/pmgr/uninstall") {
        const name2 = str(body.name);
        if (!name2.trim()) {
          sendError(res, 400, "\u7F3A\u5C11\u63D2\u4EF6\u540D");
          return;
        }
        sendJson(res, 200, await manager.uninstall(name2));
      } else if (pathname === "/pmgr/stop") {
        const name2 = str(body.name);
        if (!name2.trim()) {
          sendError(res, 400, "\u7F3A\u5C11\u63D2\u4EF6\u540D");
          return;
        }
        sendJson(res, 200, await manager.stop(name2));
      } else if (pathname === "/pmgr/start") {
        const name2 = str(body.name);
        if (!name2.trim()) {
          sendError(res, 400, "\u7F3A\u5C11\u63D2\u4EF6\u540D");
          return;
        }
        sendJson(res, 200, await manager.start(name2));
      } else if (pathname === "/pmgr/search") {
        sendJson(res, 200, await manager.search(body.q));
      } else if (pathname === "/pmgr/resolve") {
        sendJson(res, 200, await manager.resolve(body.name));
      } else if (pathname === "/pmgr/settings") {
        sendJson(res, 200, await manager.setSettings({ autoRestart: body.autoRestart === true }));
      } else if (pathname === "/pmgr/restart") {
        sendJson(res, 200, await manager.restart());
      } else {
        sendError(res, 404, "not found");
      }
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : String(error));
    }
  };
}

// src/host/index.ts
var name = NAME;
var inject = ["webServer"];
function apply(ctx, config) {
  const profile = config && typeof config.profile === "string" && config.profile || DEFAULT_PROFILE;
  const webServer = ctx.get("webServer");
  if (webServer === void 0) {
    console.log(NAME + ": webServer \u4E0D\u53EF\u7528\uFF0C\u8DF3\u8FC7\u8DEF\u7531\u6CE8\u518C");
    return;
  }
  ctx.effect(() => {
    const route = {
      kind: "prefix",
      path: ROUTE_PREFIX,
      handler: createHandler(ctx, profile)
    };
    return webServer.register(route);
  }, NAME + ": routes");
  console.log(NAME + ": host ready (profile=" + profile + ", routes=" + ROUTE_PREFIX + "/*)");
}
export {
  apply,
  inject,
  name
};

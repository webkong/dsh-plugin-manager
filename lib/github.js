// src/host/github.ts
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
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
    const gh = join(home, ".config", "gh", "hosts.yml");
    if (existsSync(gh)) {
      const m = readFileSync(gh, "utf8").match(/oauth_token:\s*([^\s]+)/);
      if (m && m[1]) return m[1];
    }
    for (const f of [".zshrc", ".zprofile", ".bashrc", ".bash_profile", ".profile"]) {
      const p = join(home, f);
      if (!existsSync(p)) continue;
      const m = readFileSync(p, "utf8").match(/export\s+(?:GH_TOKEN|GITHUB_TOKEN)\s*=\s*["']?([^"'\s]+)/);
      if (m && m[1]) return m[1];
    }
    const gc = join(home, ".gitconfig");
    if (existsSync(gc)) {
      const m = readFileSync(gc, "utf8").match(/\[github\][\s\S]*?token\s*=\s*([^\s]+)/);
      if (m && m[1]) return m[1];
    }
  } catch {
  }
  return null;
}
export {
  githubUrlFromRepo,
  githubUrlFromSpec,
  loadGithubToken,
  specSource
};

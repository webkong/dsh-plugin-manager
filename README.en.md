<p align="center">
  <img src="assets/demo.gif" alt="dsh-plugin-manager demo" width="720" />
</p>

<p align="center">
  <b>🚀 The plugin butler for DeepSeek Harness</b><br />
  Install · Uninstall · Start · Stop — manage your whole DSH plugin ecosystem in one place
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-version-compatibility">Compatibility</a> ·
  <a href="#-installation">Installation</a> ·
  <a href="#-configuration">Configuration</a> ·
  <a href="#-development">Development</a> ·
  <a href="README.md">中文</a>
</p>

---

# dsh-plugin-manager

Manage DeepSeek Harness plugins **as easily as ordering takeout**.

No more hunting through GitHub, typing CLI commands, or hand-editing configs. Open 设置 → 插件 → **Plugin Manager** and every built-in / third-party plugin is right there — install, uninstall, start, stop, and GitHub deep-links all on one page.

![Plugin list](assets/plugin-list.png)

![Install dialog](assets/install-dialog.png)

## ✨ Features

### 🧭 Full visibility at a glance
- **Built-in vs third-party**: enumerates 150+ built-in plugins from the live Loader (consistent with DSH's own list); packages in profile `dependencies` are auto-flagged as manageable third-party
- **Agent-preset awareness** (dsh ≥ 0.1.2): plugins mounted by an agent preset composition carry a `Preset …` tag, so a disabled root Loader row no longer makes them look stopped
- **State at a glance**: running ● / stopped / failed-to-load, source badges (npm / GitHub / local), version, and GitHub entry right on each card

### 🧩 Smarter than you'd expect
- **Multiple install sources**: npm names, `github:owner/repo#main`, local paths, tarball URLs — all supported
- **Bare-name smart resolve**: type a bare name like `dsh-paste-input` and it auto-detects whether it's an npm package or a GitHub repo — GitHub hits show candidate repos for one-click install
- **GitHub marketplace search**: search `topic:dsh-plugin` by keyword to discover hidden gems in the ecosystem

### 🎛 Precision under the hood
- **Stop / start**: resolves a third-party bundle's loader entry ids and writes / removes the `disabled` flag in the profile `cordis.patch.yml` — reconcile-proof
- **Uninstall**: clean and thorough, even sweeping leftover stop entries
- **GitHub deep-link**: click the version number (↗) on a card to jump straight to the repo

### ⚡ Automation to the last mile
- **Auto-restart**: optionally auto-restart dsh web after install/uninstall (off by default); a 10s countdown auto-refreshes, then a top-right toast offers one-click jump back
- **GitHub token auto-discovery**: probes env / gh CLI / shell rc / git config for `GH_TOKEN`, and kindly explains the rate limit when unset
- **Filters & search**: status tabs + source filter + fuzzy search, collapsible built-in / third-party groups

### 🌏 Polished for everyone
- Full 中文 / English UI, following the DSH language preference

> ⚠️ Install / uninstall / stop / start take effect **after a restart** (stop/start may apply immediately when HMR is active).

## 🔖 Version Compatibility

Check your dsh version first (`dsh --version`), then pick the plugin version from this table:

| Plugin version | Targets dsh | 0.1.1-rc.2 | 0.1.2-alpha.3 | Notes |
| --- | --- | :---: | :---: | --- |
| **0.7.x** (current) | **0.1.1-rc.2 … 0.1.2-alpha.x** | ✅ verified | ✅ verified | One codebase for both generations: it handles the sync *and* async signatures of `pluginInventory.list()`, and tags agent-preset composition rows on dsh 0.1.2 |
| 0.6.x | 0.1.1-rc.2 … 0.1.2-alpha.x | ✅ | ⚠️ degraded | On dsh ≥ 0.1.2 `list()` became async; reading it synchronously makes the inventory **silently collapse** to the profile's `bundles`/`dependencies` rows, all shown as not mounted — with no error at all |
| ≤ 0.5.x | ≤ 0.1.1-rc.x | ✅ | ❌ broken | The client `inject` list still references `dsh-client-runtime`, removed in dsh 0.1.2, so the client never loads (the settings tab never appears) |

> Bottom line: **use 0.7.x on any dsh generation** — it stays fully backward compatible with 0.1.1, so there is no reason to stay on an older release.

<details>
<summary>v0.7.0 measured results</summary>

| dsh version | `/pmgr/list` inventory | The plugin itself |
| --- | --- | --- |
| 0.1.1-rc.2 | 142 rows (141 mounted) | `entryIds:["pmgr"]`, `fiberPhase:"active"` |
| 0.1.2-alpha.3 | 160 rows (159 mounted, 32 of them mounted by agent-preset compositions) | same |

(For comparison: 0.6.x on dsh 0.1.2 enumerates only 4 rows, all `mounted:false`.)

</details>

## 📦 Installation

```bash
# 0. Know your dsh version and the target profile
dsh --version

# 1. From GitHub (recommended; main is the latest)
dsh plugin --profile web add github:webkong/dsh-plugin-manager#main

# Or pin a release tag
dsh plugin --profile web add github:webkong/dsh-plugin-manager#v0.7.0

# Or from a local path (development / offline)
dsh plugin --profile web add /path/to/dsh-plugin-manager

# 2. Restart dsh web
```

Then open 设置 → 插件 → **Plugin Manager**.

### 💡 Installation tips

- **Match the profile**: `--profile <name>` must be the profile you actually boot (`dsh web` boots `web`). To manage a *different* profile, set `config.profile` on the load row (see Configuration).
- **Restart is required**: install / uninstall / stop / start all rewrite profile configuration and take effect **after restarting dsh web**. Enable "auto-restart after install" in the UI to let the plugin do it for you (10s countdown, page auto-refresh).
- **No build step**: `lib/` build artifacts are committed, so `add` is enough — you do not need to run `pnpm build` in the plugin directory.
- **Upgrading**: re-run the same `add` command (GitHub sources are re-fetched), then restart. For a local `link:` install, run `pnpm build` in the plugin directory and restart.
- **Uninstalling**: click Uninstall in the UI, or `dsh plugin --profile web remove @webkong/dsh-plugin-manager`, then restart.
- **Never load it twice**: after `add`, the plugin already sits in `dsh.profile.bundles` — do **not** also `insert` an `id: pmgr` row in the profile's `cordis.patch.yml`. dsh ≥ 0.1.2 refuses to boot (`duplicate loader entry id: pmgr`). Use the override form below instead.
- **GitHub rate limits**: set `GH_TOKEN` (or run `gh auth login`) before using "Search GitHub", otherwise you get roughly 10 requests/min.

## ⚙️ Configuration

The `web` profile is managed by default. After `dsh plugin add` the plugin already sits in `dsh.profile.bundles`
(its bundle patch inserts the `pmgr` row), so configure it by **overriding that row** in the profile's
`cordis.patch.yml` — a patch entry with `id` and without `insert` is an override:

```yaml
- id: pmgr
  config:
    profile: web        # profile to manage (default: web)
```

> ⚠️ dsh ≥ 0.1.2 fails to boot on duplicate Loader row ids (`duplicate loader entry id: pmgr`).
> If a profile both loads the bundle and re-inserts `- id: pmgr`, convert the latter into the override form above.

The auto-restart toggle is also switchable in the UI anytime (persisted to `~/.dsh/dsh-plugin-manager.json`).

## 🔧 Development

```bash
pnpm install
pnpm build      # esbuild: src/ → lib/ (Host ESM + Client __ModuleLoader__ bundle)
pnpm typecheck  # strict type-checking under dual tsconfig (node / DOM+React)
pnpm test       # node --test pure-function unit tests (9 cases)
pnpm check      # typecheck + artifact syntax check
```

### Structure (TypeScript, modular)

**v0.5.0 migrated the whole codebase to TypeScript modules** (following the official ui-plugin layout); build artifacts live in `lib/`:

```
dsh-plugin-manager/
├── package.json              # dsh.bundle / dsh.client declarations, scripts
├── cordis.patch.yml          # bundle patch: mounts the pmgr row
├── build.mjs                 # esbuild 3-stage build (Host / Client / pure-function submodules)
├── tsconfig.json             # Host type-check (node env)
├── tsconfig.client.json      # Client type-check (DOM + React env)
├── lib/                      # build artifacts (committed; zero-config after install)
│   ├── index.js              # Host single-file ESM bundle
│   ├── client.js             # Client __ModuleLoader__ bundle
│   ├── entryIds.js           # pure-function submodules (imported by unit tests)
│   ├── github.js / patch.js / spec.js
└── src/
    ├── host/                 # Host source (TypeScript, node env)
    │   ├── index.ts          # entry: name/inject/apply + webServer route registration
    │   ├── handlers.ts       # HTTP dispatch (list/install/uninstall/stop/start/search/resolve/settings/restart)
    │   ├── manager.ts        # business layer: inventory, CRUD, search/resolve (DI of fs tools)
    │   ├── fsutil.ts         # node:fs + child_process + settings persistence
    │   ├── resolve.ts        # dual-anchor package resolution / metadata reading
    │   ├── entryIds.ts       # bundle patch loader-entry id discovery
    │   ├── github.ts         # GitHub URL extraction + GH_TOKEN reading
    │   ├── spec.ts           # install-spec validation
    │   ├── patch.ts          # cordis.patch.yml stop/start text ops
    │   └── http.ts           # JSON responses / loopback guard
    └── client/               # Client source (TypeScript, DOM + React env)
        ├── index.ts          # apply entry + settings tab / shell.overlay registration
        ├── api.ts            # fetch wrapper + pmgr method table
        ├── components.tsx    # status tabs / toolbar / install dialog / plugin card
        ├── i18n.ts           # zh / en dictionary (key-typed)
        ├── spec.ts           # client-side spec validation + bare-name detection
        ├── styles.ts         # CSS injection
        ├── toast.tsx         # restart toast + one-click jump
        ├── types.ts          # contract types (wire shapes / dialog state)
        └── ui.tsx            # page orchestration / grouping / action dialogs
├── assets/                   # demo GIF + screenshots
└── test/pure.test.mjs        # unit tests (node --test)
```

### Wire contract

The Host exposes an HTTP API on the `webServer` prefix route `/pmgr/*` (loopback-only); the client calls it via browser `fetch`:

| Route | Description |
| --- | --- |
| `GET /pmgr/list` | plugin inventory + settings |
| `POST /pmgr/install` | install (`{spec}`) |
| `POST /pmgr/uninstall` | uninstall (`{name}`) |
| `POST /pmgr/stop` / `POST /pmgr/start` | stop / start (`{name}`) |
| `POST /pmgr/search` | GitHub plugin search (`{q}`) |
| `POST /pmgr/resolve` | resolve a bare name (npm check / GitHub candidates) |
| `POST /pmgr/settings` | update settings (`{autoRestart}`) |
| `POST /pmgr/restart` | trigger an auto-restart |

## 📄 License

[MIT](LICENSE)

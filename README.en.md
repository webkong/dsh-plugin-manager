<p align="center">
  <img src="assets/demo.gif" alt="dsh-plugin-manager demo" width="720" />
</p>

<p align="center">
  <b>🚀 The plugin butler for DeepSeek Harness</b><br />
  Install · Uninstall · Start · Stop — manage your whole DSH plugin ecosystem in one place
</p>

<p align="center">
  <a href="#-features">Features</a> ·
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
- **Built-in vs third-party**: enumerates 130+ built-in plugins from the live Loader (consistent with DSH's own list); packages in profile `dependencies` are auto-flagged as manageable third-party
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

## 📦 Installation

```bash
# From GitHub
dsh plugin --profile web add github:webkong/dsh-plugin-manager#main

# Or from a local path (development)
dsh plugin --profile web add /path/to/dsh-plugin-manager
```

Restart dsh web, then open 设置 → 插件 → **Plugin Manager**.

## 🔖 Version Compatibility

| Plugin version | Compatible dsh versions | Notes |
| --- | --- | --- |
| **0.6.x** | ≥ 0.1.1-rc.2 (verified on 0.1.1-rc.2 and 0.1.2-alpha.1) | Removed `dsh-client-runtime` from the client `inject` list (that package was removed in dsh 0.1.2) |
| ≤ 0.5.x | ≤ 0.1.1-rc.x | On dsh ≥ 0.1.2 older clients never load while waiting for the removed `dsh-client-runtime` |

## ⚙️ Configuration

The `web` profile is managed by default. Override it — and disable auto-restart — in the load row:

```yaml
- insert:
    - id: pmgr
      name: '@webkong/dsh-plugin-manager'
      config:
        profile: web        # profile to manage (default: web)
```

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
├── lib/                      # build artifacts (gitignored)
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

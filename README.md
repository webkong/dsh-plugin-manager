<p align="center">
  <img src="assets/demo.gif" alt="dsh-plugin-manager demo" width="720" />
</p>

<p align="center">
  <b>🚀 为 DeepSeek Harness 而生的插件管家</b><br />
  装 · 卸 · 启 · 停，一站式管理你的 DSH 插件生态
</p>

<p align="center">
  <a href="#-功能亮点">功能亮点</a> ·
  <a href="#-版本兼容">版本兼容</a> ·
  <a href="#-安装">安装</a> ·
  <a href="#-配置">配置</a> ·
  <a href="#-开发">开发</a> ·
  <a href="README.en.md">English</a>
</p>

---

# dsh-plugin-manager

让 DeepSeek Harness 的插件管理**第一次变得像点外卖一样简单**。

以前装一个 DSH 插件要翻 GitHub、敲命令、改配置；现在打开 设置 → 插件 → **插件管理**，内置 / 三方插件一览无余，安装、卸载、启停、GitHub 溯源全部在一个页面里完成。

![插件列表](assets/plugin-list.png)

![安装插件弹窗](assets/install-dialog.png)

## ✨ 功能亮点

### 🧭 全局视野，一目了然
- **内置 vs 三方**：以 Loader 实时行为主枚举全部 150+ 内置插件，与 DSH 自带列表完全一致；profile dependencies 中的自动识别为第三方、可管理
- **状态一眼可见**：运行中 ● / 已停用 / 加载失败，来源标签（npm / GitHub / 本地）、版本、GitHub 入口全在卡片上
- **预设组合可见**（dsh ≥ 0.1.2）：被 agent preset 组合装载的插件带「预设 xxx」标签，不再因为根 Loader 行是 disabled 就被误报「已停用」

### 🧩 安装，比你想象的更聪明
- **多种安装源**：npm 包名、`github:owner/repo#main`、本地路径、tarball URL，通通支持
- **裸包名智能解析**：输入 `dsh-paste-input` 这种裸名字，自动探测是 npm 包还是 GitHub 仓库——命中 GitHub 直接列出候选仓库，一键安装
- **GitHub 市场搜索**：按关键词搜 `topic:dsh-plugin`，发现生态里还没人注意到的宝藏插件

### 🎛 启停卸载，背后是精密的手术
- **停用 / 启动**：自动解析三方插件 bundle 的装载条目 id，向 profile 的 `cordis.patch.yml` 精确写入 / 移除 `disabled` 标记，对 reconcile 免疫
- **卸载**：干净利落，连残留的停用条目一起清理
- **GitHub 直跳**：点卡片上的版本号（↗）直达仓库，看文档、看 star、看代码

### ⚡ 自动化到最后一公里
- **自动重启**：装完自动重启 dsh web（可选，默认关），10 秒倒计时自动刷新页面，重启完成右上角 toast 一键跳回本页
- **GitHub token 自动发现**：环境变量 / gh CLI / shell rc / git config 逐级探测 `GH_TOKEN`，未配置时贴心地提示限流原因
- **筛选与搜索**：状态 Tab + 来源筛选 + 模糊搜索，内置 / 三方分组可折叠

### 🌏 为中文用户打磨
- 全中文界面 + English，跟随 DSH 语言偏好自动切换

> ⚠️ 安装 / 卸载 / 停用 / 启动均在**重启后生效**（若当前进程 HMR 已激活，停用/启动可能即时生效）。

## 🔖 版本兼容

先确认你的 dsh 版本（`dsh --version`），再对照下表选插件版本：

| 插件版本 | 适配的 dsh 版本 | 0.1.1-rc.2 | 0.1.2-alpha.3 | 说明 |
| --- | --- | :---: | :---: | --- |
| **0.7.x**（当前） | **0.1.1-rc.2 ～ 0.1.2-alpha.x** | ✅ 实测 | ✅ 实测 | 一份代码同时适配两代：`pluginInventory.list()` 的同步 / 异步两种签名都能处理；dsh 0.1.2 的 agent preset 组合行会额外标出「预设 xxx」 |
| 0.6.x | 0.1.1-rc.2 ～ 0.1.2-alpha.x | ✅ | ⚠️ 功能受损 | dsh ≥ 0.1.2 起 `list()` 变成 async，旧代码同步读取 → **清单静默退化**：只剩 profile 的 bundles/dependencies 几行且全部显示「未装载」，且无任何报错 |
| ≤ 0.5.x | ≤ 0.1.1-rc.x | ✅ | ❌ 不可用 | client `inject` 仍引用 dsh 0.1.2 已移除的 `dsh-client-runtime`，client 完全不加载（插件管理页出不来） |

> 结论：**无论你用哪一代 dsh，都建议直接用 0.7.x** —— 它对 0.1.1 完全向下兼容，没有停留在旧版本的理由。

<details>
<summary>v0.7.0 实测数据</summary>

| dsh 版本 | `/pmgr/list` 枚举 | 本插件自身 |
| --- | --- | --- |
| 0.1.1-rc.2 | 142 行（mounted 141） | `entryIds:["pmgr"]`、`fiberPhase:"active"` |
| 0.1.2-alpha.3 | 160 行（mounted 159，其中 32 行由 agent preset 组合装载） | 同上 |

（对比：0.6.x 在 0.1.2 上只能枚举到 4 行，且全部 `mounted:false`。）

</details>

## 📦 安装

```bash
# 0. 先看清楚 dsh 版本与要装到哪个 profile
dsh --version

# 1. 从 GitHub 安装（推荐；main 为最新）
dsh plugin --profile web add github:webkong/dsh-plugin-manager#main

# 或锁定某个已发布的版本 tag
dsh plugin --profile web add github:webkong/dsh-plugin-manager#v0.7.0

# 或从本地路径安装（开发 / 离线）
dsh plugin --profile web add /path/to/dsh-plugin-manager

# 2. 重启 dsh web 后生效
```

重启后进入 设置 → 插件 → **插件管理** 即可使用。

### 💡 安装建议

- **profile 要对齐**：`--profile <name>` 必须是你实际启动的那个 profile（`dsh web` 默认启动 `web`）。想让插件管理**另一个** profile 的插件，改配置行的 `config.profile`（见下方「配置」）。
- **装完必须重启**：安装 / 卸载 / 停用 / 启用都是改 profile 配置，**重启 dsh web 才生效**；懒得手动重启就在页面上打开「安装后自动重启」（10 秒倒计时自动刷新页面）。
- **无需构建**：`lib/` 构建产物已入库，`add` 完直接可用，不需要在插件目录里跑 `pnpm build`。
- **升级**：重复执行一次上面的 `add` 命令（GitHub 源会重新拉取）后重启即可；本地 `link:` 安装的话在插件目录 `pnpm build` 后重启。
- **卸载**：页面上点「卸载」，或 `dsh plugin --profile web remove @webkong/dsh-plugin-manager`，然后重启。
- **不要重复装载**：`add` 之后本插件已经在 `dsh.profile.bundles` 里，**别再在 profile 的 `cordis.patch.yml` 里 `insert` 一次同名 `id: pmgr`** —— dsh ≥ 0.1.2 会直接启动失败（`duplicate loader entry id: pmgr`）。要改配置请用下面的覆盖写法。
- **GitHub 搜索限流**：需要用「搜索 GitHub」发现插件时，建议先设好 `GH_TOKEN`（或 `gh auth login`），否则约 10 次/分钟。

## ⚙️ 配置

默认管理 `web` profile。`dsh plugin add` 安装后本插件已在 `dsh.profile.bundles` 里（其 bundle patch 会插入 `pmgr` 行），
要改配置请在 profile 的 `cordis.patch.yml` 里**覆盖这一行**（带 `id`、不带 `insert` 即为覆盖）：

```yaml
- id: pmgr
  config:
    profile: web        # 管理的 profile（默认 web）
```

> ⚠️ dsh ≥ 0.1.2 对重复的 Loader 行 id 会直接**启动失败**（`duplicate loader entry id: pmgr`）。
> 如果既在 `bundles` 里装载、又在 profile patch 里 `insert: - id: pmgr`，请把后者改成上面的覆盖写法。

自动重启开关在页面上可随时切换（持久化到 `~/.dsh/dsh-plugin-manager.json`）。

## 🔧 开发

```bash
pnpm install
pnpm build      # esbuild 打包 src/ → lib/（Host ESM + Client __ModuleLoader__ bundle）
pnpm typecheck  # tsc 双配置严格类型检查（node / DOM+React）
pnpm test       # node --test 纯函数单元测试（9 用例）
pnpm check      # typecheck + 产物语法检查
```

### 结构（TypeScript 模块化）

**v0.5.0 起源码整体迁移为 TypeScript 模块化组织**（参考官方 ui 插件结构），构建产物在 `lib/`：

```
dsh-plugin-manager/
├── package.json              # dsh.bundle / dsh.client 声明，scripts
├── cordis.patch.yml          # bundle patch：装载 pmgr 行
├── build.mjs                 # esbuild 三阶段构建（Host / Client / 纯函数子模块）
├── tsconfig.json             # Host 类型检查（node 环境）
├── tsconfig.client.json      # Client 类型检查（DOM + React 环境）
├── lib/                      # 构建产物（已入库，安装后零配置可用）
│   ├── index.js              # Host 单文件 ESM bundle
│   ├── client.js             # Client __ModuleLoader__ bundle
│   ├── entryIds.js           # 纯函数子模块（供单元测试 import）
│   ├── github.js / patch.js / spec.js
└── src/
    ├── host/                 # Host 源码（TypeScript，Node 环境）
    │   ├── index.ts          # 入口：name/inject/apply + webServer 路由注册
    │   ├── handlers.ts       # HTTP 分发（list/install/uninstall/stop/start/search/resolve/settings/restart）
    │   ├── manager.ts        # 业务层：清单、增删启停、搜索/解析（依赖注入 fs 工具）
    │   ├── fsutil.ts         # node:fs + child_process + 设置持久化
    │   ├── resolve.ts        # 双锚点包解析 / 元数据读取
    │   ├── entryIds.ts       # bundle patch 装载条目 id 发现
    │   ├── github.ts         # GitHub URL 提取 + GH_TOKEN 读取
    │   ├── spec.ts           # 安装 spec 校验
    │   ├── patch.ts          # cordis.patch.yml 停用/启用文本操作
    │   └── http.ts           # JSON 响应 / loopback 校验
    └── client/               # Client 源码（TypeScript，DOM + React 环境）
        ├── index.ts          # apply 入口 + settings tab / shell.overlay 注册
        ├── api.ts            # fetch 封装 + pmgr 方法表
        ├── components.tsx    # 状态 Tab / 工具栏 / 安装弹窗 / 插件卡片
        ├── i18n.ts           # zh / en 文案字典（键类型校验）
        ├── spec.ts           # 客户端 spec 校验 + 裸包名判定
        ├── styles.ts         # CSS 注入
        ├── toast.tsx         # 重启完成 toast + 一键跳转
        ├── types.ts          # 契约类型（wire 形状 / 弹窗状态）
        └── ui.tsx            # 页面编排 / 分组 / 操作弹窗
├── assets/                   # demo GIF + 截图
└── test/pure.test.mjs        # 单元测试（node --test）
```

### 通信契约

Host 通过 `webServer` 前缀路由 `/pmgr/*` 提供 HTTP API（仅限本机 loopback），客户端用浏览器 `fetch` 调用：

| 路由 | 说明 |
| --- | --- |
| `GET /pmgr/list` | 插件清单 + 设置 |
| `POST /pmgr/install` | 安装（`{spec}`） |
| `POST /pmgr/uninstall` | 卸载（`{name}`） |
| `POST /pmgr/stop` / `POST /pmgr/start` | 停用 / 启用（`{name}`） |
| `POST /pmgr/search` | 搜索 GitHub 插件（`{q}`） |
| `POST /pmgr/resolve` | 解析裸包名（npm 判定 / GitHub 候选） |
| `POST /pmgr/settings` | 更新设置（`{autoRestart}`） |
| `POST /pmgr/restart` | 手动触发自动重启 |

## 📄 许可证

[MIT](LICENSE)

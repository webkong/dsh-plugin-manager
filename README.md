[English](./README.en.md) · 中文

# dsh-plugin-manager

一个用于 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 的插件管理器，在 Web 设置页提供「插件管理」页签：列出**内置 / 三方**插件，支持**安装、卸载、启动、停用**，并直跳三方插件的 GitHub 仓库。

![插件管理演示](assets/demo.gif)

![插件列表](assets/plugin-list.png)

![安装插件弹窗](assets/install-dialog.png)

## 功能

- **内置 vs 三方**：以 Loader 实时行为主枚举全部内置插件（与 DSH 自带列表一致）；profile dependencies 中的为三方、可管理
- **安装**：`dsh plugin --profile web add <spec>`（npm 包名 / `github:owner/repo#main` / 任意 pnpm 标识）
- **智能解析**：输入裸包名（如 `dsh-paste-input`）时自动探测是 npm 包还是 GitHub 仓库，命中 GitHub 则列出候选一键安装
- **卸载**：`dsh plugin --profile web remove <name>`，并清理残留停用条目
- **停用 / 启动**：解析三方插件 bundle 的装载条目 id，向 profile 的 `cordis.patch.yml` 写入 / 移除 `{ id, name, disabled: true }`；解析不到时兜底增删 bundles 列表
- **GitHub 直跳**：卡片包名后的版本号（下划线 + ↗）即仓库入口，取自依赖声明或已安装包 `repository` 字段
- **自动重启**：安装 / 卸载成功后可选自动重启 dsh web（默认关闭）；重启后 10 秒倒计时自动刷新页面，完成后右上角 toast 提示并可一键跳回本页签
- **GitHub token**：自动从环境变量 / gh CLI / shell rc / git config 读取 `GH_TOKEN` 用于 GitHub API，未配置时提示限流
- **筛选与搜索**：状态筛选 Tab + 来源筛选 + 模糊搜索，内置 / 三方分组（可折叠）
- **多语言**：中文 / English，跟随 DSH 语言偏好

> 安装 / 卸载 / 停用 / 启动均在**重启后生效**（若当前进程 HMR 已激活，停用/启动可能即时生效）。

## 安装

```bash
# 从 GitHub 安装
dsh plugin --profile web add github:webkong/dsh-plugin-manager#main

# 或从本地路径安装（开发）
dsh plugin --profile web add /path/to/dsh-plugin-manager
```

重启 dsh web 后，进入 设置 → 插件 → **插件管理** 即可使用。

## 配置

默认管理 `web` profile。可在装载行配置覆盖，并关闭自动重启：

```yaml
- insert:
    - id: pmgr
      name: '@webkong/dsh-plugin-manager'
      config:
        profile: web        # 管理的 profile（默认 web）
```

自动重启开关在页面上可随时切换（持久化到 `~/.dsh/dsh-plugin-manager.json`）。

## 开发

```bash
pnpm build      # esbuild 打包 client/src → lib/client.js
pnpm check      # node --check 全部模块
pnpm test       # node --test 纯函数单元测试
```

### 结构

```
dsh-plugin-manager/
├── package.json            # dsh.bundle / dsh.client 声明，scripts
├── cordis.patch.yml        # bundle patch：装载 pmgr 行
├── build.mjs               # esbuild 打包 client/src → lib/client.js
├── lib/                    # Host 半部（零外部依赖，纯 ESM + node 内置）
│   ├── index.js            # 入口：name/inject/apply + webServer 路由注册
│   ├── constants.js        # 路由前缀 / 停用标记 / 默认 profile
│   ├── handlers.js         # HTTP 分发（list/install/uninstall/stop/start/search/resolve/settings/restart）
│   ├── manager.js          # 业务层：清单、增删启停、搜索/解析（依赖注入 fs 工具）
│   ├── fsutil.js           # node:fs + child_process + 设置持久化
│   ├── resolve.js          # 双锚点包解析 / 元数据读取
│   ├── entryIds.js         # bundle patch 装载条目 id 发现
│   ├── github.js           # GitHub URL 提取 + GH_TOKEN 读取
│   ├── spec.js             # 安装 spec 校验
│   ├── patch.js            # cordis.patch.yml 停用/启用文本操作
│   └── http.js             # JSON 响应 / loopback 校验
├── client/src/             # Client 源码（模块化，构建为单 bundle）
│   ├── index.js            # apply 入口 + settings tab / shell.overlay 注册
│   ├── api.js              # fetch 封装 + pmgr 方法表
│   ├── components.js       # 状态 Tab / 工具栏 / 安装弹窗 / 插件卡片
│   ├── i18n.js             # zh / en 文案字典
│   ├── spec.js             # 客户端 spec 校验 + 裸包名判定
│   ├── styles.js           # CSS 注入
│   ├── toast.js            # 重启完成 toast + 一键跳转
│   └── ui.js               # 页面编排 / 分组 / 操作弹窗
├── assets/demo.gif            # 插件管理演示 GIF
├── assets/plugin-list.png    # 插件列表截图
├── assets/install-dialog.png # 安装弹窗截图
└── test/pure.test.mjs      # 单元测试
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

## 许可证

[MIT](LICENSE)

# dsh-plugin-manager

DSH 插件管理器：在 Web 设置页（设置 → 插件 → **管理**）列出**内置**与**三方**插件，支持安装、卸载、启动、停用，并直跳三方插件的 GitHub 仓库。

## 功能

- **内置 vs 三方**：以 Loader 实时行为主枚举全部内置插件（与 DSH 自带列表一致的挂载行/包）；profile dependencies 中的为三方、可管理
- **安装**：`dsh plugin --profile web add <spec>`（npm 包名 / `github:owner/repo#main` / 任意 pnpm 标识）
- **卸载**：`dsh plugin --profile web remove <name>`，并清理残留停用条目
- **停用 / 启动**：解析三方插件 bundle 的 `cordis.patch.yml` 找到装载条目 id，向 profile 的
  `cordis.patch.yml` 写入 / 移除 `{ id, name, disabled: true }`（对 reconcile 免疫）；解析不到时兜底增删 bundles 列表
- **GitHub 直跳**：三方插件卡片的「GitHub ↗」链接取自依赖声明（`github:owner/repo#branch`）或已安装包的 `repository` 字段
- **运行时状态**：合并 Loader 的 `pluginInventory`，展示已装载/运行中/失败

> 安装 / 卸载 / 停用 / 启动均在**重启后生效**（若当前进程 HMR 已激活，停用/启动可能即时生效）。

## 安装

```bash
# 从本地路径安装（开发）
dsh plugin --profile web add /path/to/dsh-plugin-manager

# 或从 GitHub 安装
dsh plugin --profile web add github:webkong/dsh-plugin-manager#main
```

重启 dsh web 后，设置 → 插件 → 管理 即可使用。默认管理 `web` profile，可在装载行配置覆盖：

```yaml
- insert:
    - id: pmgr
      name: 'dsh-plugin-manager'
      config:
        profile: tui
```

## 开发流程

```bash
# 1. 本地安装到 profile（link 指向本项目）
dsh plugin --profile web add /path/to/dsh-plugin-manager

# 2. 构建 / 校验 / 测试
pnpm build        # esbuild 打包 client/src → lib/client.js
pnpm check        # node --check 全部模块
pnpm test         # node --test 纯函数单元测试（pretest 自动 build）

# 3. 改代码 → 重启 dsh web → 在「管理」标签页验证 → 迭代
```

### 结构（模块化）

```
dsh-plugin-manager/
├── package.json            # dsh.bundle / dsh.client 声明，scripts（build/check/test）
├── cordis.patch.yml        # bundle patch：装载 pmgr 行
├── build.mjs               # esbuild 打包 client/src → lib/client.js
├── lib/                    # Host 半部（零外部依赖，纯 ESM + node 内置）
│   ├── index.js            # 入口：name/inject/apply + webServer 路由注册（薄壳）
│   ├── constants.js        # 路由前缀 / 停用标记 / 默认 profile
│   ├── handlers.js         # HTTP 请求分发（list/install/uninstall/stop/start）
│   ├── manager.js          # 业务层：清单与增删启停（依赖注入 shell 工具）
│   ├── fsutil.js           # node:fs + child_process（继承 process.env，不依赖 shell 服务）
│   ├── resolve.js          # 双锚点包解析 / 包元数据读取（进程内 createRequire）
│   ├── entryIds.js         # bundle patch 装载条目 id 发现
│   ├── github.js           # GitHub URL 提取 / 依赖来源判定
│   ├── patch.js            # cordis.patch.yml 停用/启用文本操作
│   └── http.js             # JSON 响应 / 请求体 / loopback 校验
├── client/src/             # Client 源码（模块化，构建为单 bundle）
│   ├── index.js            # apply 入口 + slots 注册
│   ├── api.js              # fetch 封装 + pmgr 方法表
│   ├── styles.js           # CSS 注入
│   └── ui.js               # Badge / PluginManagerTab（React.createElement）
└── test/
    └── pure.test.mjs       # 纯函数单元测试（直接 import lib/* 模块）
```

### 通信契约

- HTTP 路由（仅限本机 loopback）：`GET /pmgr/list`、`POST /pmgr/install`（`{spec}`）、
  `POST /pmgr/uninstall|stop|start`（`{name}`），返回 `{ ok, message, output, ... }` 信封
- 采用 webServer 而非 Typert Remote：插件**零外部依赖**，放在任意本地路径（工作区 / link / GitHub 安装）都不会出现
  模块实例分裂导致的“端点 404”问题

## 许可证

MIT

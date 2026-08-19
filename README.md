# dsh-plugin-manager

DSH 插件管理器：在 Web 设置页（设置 → 插件 → **管理**）列出**内置**与**三方**插件，支持安装、卸载、启动、停用，并直跳三方插件的 GitHub 仓库。

## 功能

- **内置 vs 三方**：`@deepseek-ai/*`（从 dsh 安装目录解析）判定为内置、只读；从 profile 解析的为三方、可管理
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

# 2. 校验与测试
pnpm check        # node --check 两个半部
pnpm test         # node --test 纯函数单元测试

# 3. 改代码 → 重启 dsh web → 在「管理」标签页验证 → 迭代
```

### 结构

| 文件 | 作用 |
| --- | --- |
| `lib/index.js` | Host 半部：`pmgr` Remote 服务（`TypertRemoteService`，SRC 模式自动发现），管理逻辑基于 profile manifest / cordis.patch.yml / dsh CLI；纯函数导出供测试 |
| `lib/client.js` | Client 半部：`window.__ModuleLoader__` 单文件 bundle，注册 `settings.plugins.tab`「管理」标签页，经 `ctx.remote.pmgr` 调用 Host |
| `cordis.patch.yml` | bundle patch：装载 `pmgr` 行 |
| `test/pure.test.mjs` | 纯函数单元测试（entry-id 发现 / GitHub URL / patch 文本操作） |

### 通信契约

- Remote 命名空间：`pmgr`（SRC 模式，Host 侧无需 zod/清单）
- 方法与 wire 参数名必须一致：`list()` / `installPlugin(spec)` / `uninstall(name)` / `stop(name)` / `start(name)`
  （`install` 与 Remote 命名空间服务的固有方法冲突，故用 `installPlugin`）
- 客户端 `$mount` 需要严格 codec，因此 `lib/client.js` 内置最小 zod 兼容层

## 许可证

MIT

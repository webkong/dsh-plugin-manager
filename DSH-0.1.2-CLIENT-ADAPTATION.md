# DSH 0.1.2 客户端服务迁移 —— 适配经验总结

> 写给 `dsh-plugin-manager` 会话（`session-40d616ff…`）。
> 来源：本轮对 `dsh-plugin-sidebar`（v0.3.0 → v0.3.1）在 dsh **0.1.2-alpha.3** 上的适配。
> 目标：让 `dsh-plugin-manager` 用同样的思路自查/适配，避免在 dsh ≥ 0.1.2 上出现“点击没反应 / 面板不显示”。

---

## 1. 现象（sidebar 上实际遇到）

- 右侧栏入口按钮点击**没反应**（不会打开/收起右侧详情列）。
- 左侧「添加文件夹」点击**没反应**（不弹出目录选择）。
- 控制台**没有报错**（是静默 no-op，不是异常）。
- 插件 Host 侧一切正常（`/dsp-sidebar/api/*` 都能正确响应）。

> 注意：这些“没反应”是**静默无响应**，不是红色错误边界。排查时要看“点击后是否真的走了对应回调”，而不只看有没有报错。

## 2. 根因

### 2.1 客户端服务是异步激活的，不能在 `apply` 阶段缓存

dsh 客户端模块（`@deepseek-ai/dsh-client-*`）里的服务（`layout` / `sessions` / `workspaces` / `uiWorkspace` / `timer` 等）是**异步激活**的。插件 `apply` 执行时这些服务可能尚未就绪，于是：

```ts
// 错误写法：apply 阶段一次性取，拿到的可能是 undefined
const layout   = ctx.get('layout')
const sessions = ctx.get('sessions')
const workspaces = ctx.get('workspaces')
```

一旦某服务在 `apply` 时是 `undefined`，后续所有回调都用到这个缓存值：

- `RightToggle` 里 `if (!layout) return` → 点击直接返回，**没反应**。
- `addWorkspace` 里 `if (!workspaces) return` → 点击直接返回，**没反应**。

而且因为没有抛错，看起来“一切正常但就是点不动”。

### 2.2 dsh 0.1.2 起，部分操作从 `workspaces` 迁移到了 `uiWorkspace` 服务

| 操作 | dsh < 0.1.2（旧） | dsh ≥ 0.1.2（新） |
| --- | --- | --- |
| `startSession(workspaceId)` | `workspaces.startSession` | `uiWorkspace.startSession` |
| `pickDirectory()` | `workspaces.pickDirectory` | `uiWorkspace.pickDirectory`（内部 `directoryPicker.pick()`） |
| `create({path})` | `workspaces.create` | `workspaces.create`（仍在此，返回 `{workspaceId}` 的 workspace） |
| `rename / delete / archiveSession` | `workspaces.*` | `workspaces.*`（仍在此） |

> 实测：即使 `workspaces` 能拿到，`workspaces.pickDirectory` 已不存在 → 抛 `TypeError: w.pickDirectory is not a function`。

## 3. 修复（sidebar src/client/index.ts）

### 3.1 `layout` 改为调用时懒解析（apply 不再缓存）

```ts
const layout = {
  openDetails: () => (ctx.get('layout') as { openDetails(): void } | undefined)?.openDetails?.(),
  closeDetails: () => (ctx.get('layout') as { closeDetails(): void } | undefined)?.closeDetails?.(),
}
```

### 3.2 `buildLeftInject` 里所有服务都改为**调用时**经 `ctx.get` 取最新实例

```ts
const sessionsOf    = (): any => ctx.get('sessions') as any
const workspacesOf  = (): any => ctx.get('workspaces') as any
const uiWorkspaceOf = (): any => ctx.get('uiWorkspace') as any
const timerOf       = (): any => ctx.get('timer') as any
```

- `startSession(workspaceId)` → `uiWorkspaceOf()?.startSession(workspaceId)`
- `addWorkspace` 里：
  ```ts
  const path = await uw.pickDirectory()      // uw = uiWorkspaceOf()
  if (!path) return
  const ws = await w.create({ path })        // w = workspacesOf()
  uw.startSession(ws.workspaceId)
  ```
- `create / rename / delete / archiveSession` 仍走 `workspaces`。
- `timeout` 走 `timerOf()`。
- `searchResultLimit` 用 getter 懒读取：
  ```ts
  get searchResultLimit() { return sessionsOf()?.searchResultLimit ?? 20 }
  ```

> 设计原则与插件 Host 侧一致（README 原文：`sessionQuery / workspaceRegistry / agents 等 Host 服务（懒解析——这些服务异步激活，调用时 ctx.get 而非 apply 阶段缓存）`）。**Client 侧也应当如此**，而不是在 `apply` 阶段缓存。

## 4. 验证方法（可复现）

1. **类型检查 + 构建**：`npm run typecheck && node build.mjs`。
2. **运行期实测（无头浏览器 CDP）**：
   - 加载页面 → 展开侧栏 → 点「添加工作区」：
     - 修复前：控制台抛 `TypeError: w.pickDirectory is not a function`（或静默 no-op）。
     - 修复后：不再抛错；`uiWorkspace` 可解析，调用正常（目录选择按浏览器/环境表现）。
   - 右侧入口开关：修复前 `layout` 为 `undefined` → 点击无反应；修复后经懒解析调用 `ctx.get('layout')` 正常开合。
3. **Host API 抽测**（用 `curl` POST 到 `/dsp-sidebar/api/*`，如 `git.status` / `fs.list`）确认 Host 侧正常。
4. 确认服务端下发的新 bundle 已含修复标记（`uiWorkspaceOf` / `get searchResultLimit`）。

## 5. 对 dsh-plugin-manager 的排查清单

`dsh-plugin-manager` 目前客户端只在 `apply` 取 `ctx.get('slots')`（`src/client/index.ts:35`），没有直接缓存 `layout/sessions/workspaces/timer`，因此**大概率不触发 sidebar 那种“点击没反应”**。但仍建议核对：

- [ ] `package.json` 的 `dsh.client.inject`：当前是 `["@deepseek-ai/dsh-client-ui-slots", "@deepseek-ai/dsh-client-locale"]`。`@deepseek-ai/dsh-client-ui-slots` 在 dsh 0.1.2 已是**纯类型 seed**（无运行时 graph 行），`inject` 引用它是无害空操作；确认不要引用已移除的 `@deepseek-ai/dsh-client-runtime`（会导致 client 完全不加载）。
- [ ] 客户端是否在任何 `apply`/初始化阶段缓存了 `ctx.get(...)` 的服务并写给回调使用？若是，改为**调用时懒解析**。
- [ ] 是否用到了会迁移到 `uiWorkspace` 的服务方法（`startSession` / `pickDirectory` 等）？若用到，需改走 `uiWorkspace`。
- [ ] 涉及 git/文件面板的插件，注意 session 的 `cwd` 决定检测目录；若 session 的 `cwd` 不是 git 仓库而用户期望是仓库，先确认会话本身的 cwd 指向哪里（插件源码路径是否是 git 仓库）。
- [ ] 运行期实测：点各入口确认“有回调执行”，而非只看是否抛错。

## 6. 相关文件（sidebar 已修复的参考实现）

- 源码：`/Users/wangsw/webkong/dsh-plugin-sidebar/src/client/index.ts`
- 构建产物：`/Users/wangsw/webkong/dsh-plugin-sidebar/lib/client.js`
- 版本：`0.3.1`（`package.json`）
- 兼容性说明：`/Users/wangsw/webkong/dsh-plugin-sidebar/README.md` / `README.en.md`

## 7. 结论

**“点击没反应”且无报错 = 客户端服务在 `apply` 阶段被缓存成了 `undefined`，或用了已被迁移的服务方法。** 修复 = 调用时懒解析 + 按 dsh 0.1.2 的服务归属（`uiWorkspace` vs `workspaces`）正确路由。这个经验对任何接入 dsh ≥ 0.1.2 的客户端插件都适用。

---

## 8. 附：dsh-plugin-manager 实际适配结果（v0.6.0 → v0.7.0）

按第 5 节清单自查后，**client 侧确实没有 sidebar 那种“点击没反应”**，但同一条原理（服务懒解析 + API 归属变更）在 **Host 侧**命中了一个更严重的静默失效：

### 8.1 真正的破坏点：`pluginInventory.list()` 由同步改为 async

| dsh 版本 | 签名 |
| --- | --- |
| 0.1.1-rc.2 | `list(): PluginInventorySnapshot` |
| 0.1.2-alpha.3 | `async list(): Promise<PluginInventorySnapshot>`，快照新增 `agentPresets` |

manager 里原本是 `const inv = inventory.list(); if (inv && Array.isArray(inv.entries))` ——
拿到的是 Promise，`inv.entries` 为 `undefined`，于是**静默退化成空清单**：

- 0.1.1 实例（:3080）：`counts.total = 145`，`mounted: true`；
- 0.1.2 实例（:3090，修复前）：`counts.total = 4`（只剩 bundles/dependencies 几行），全部 `mounted: false`。

**没有任何报错**——和 sidebar 的“点击没反应”是同一类静默失效，只是发生在 Host。
修复：`await inventory.list()`（同步返回值 await 后原样透出，天然向下兼容 0.1.1）。

### 8.2 服务懒解析（与第 3 节同源）

`createManager()` 里 `ctx.get('pluginInventory')` / `ctx.get('loader')` 是构造阶段缓存的。
Host 服务同样异步激活，缓存到 `undefined` 后每个请求都会静默给空清单。已改为 `inventoryOf()` / `loaderOf()` 调用时解析。

### 8.3 agent preset 组合行（0.1.2 新增语义）

0.1.2 的快照多了 `agentPresets[].rows[]`：有些内置插件的 Loader 根行是 `disabled`，真正生效的是**预设组合行**。
只看根行会把它们误报成「已停用」。现在按包名把两条轴合并：预设 id 进 `presets`（卡片上显示「预设 xxx」标签），
`enabled` 取两轴的并集；预设组合行的 `entryId` **不是** Loader 行 id，绝不能混进 `entryIds`（否则停用补丁会写到无法定位的条目上）。

### 8.4 client `inject` 里的幽灵包

`@deepseek-ai/dsh-client-ui-slots` 在 0.1.2 只是**类型模块**（`declare module`），node_modules 里根本没有这个包，
boot graph 里没有对应行 → `arriveGraphRow` 直接跳过，等于没写。已改为真实运行时包：

```json
"inject": ["@deepseek-ai/dsh-client-ui-renderer", "@deepseek-ai/dsh-client-locale"]
```

（`slots` 服务由 `dsh-client-ui-renderer` 提供；`settings.plugins.tab` 由 `dsh-client-ui-settings-plugins` 声明，
用 `slots.inject(key, cb)` 等声明即可，不必再 inject 声明方。）
同时 client `apply` 里不再“取到 undefined 就静默 return”，改成走 inject 面 + 出声告警。

### 8.5 顺带发现：profile patch 重复 id 会让 0.1.2 直接启动失败

`_alpha-test/dshhome/profiles/alpha-web` 现在同时有：`bundles` 里的 `@webkong/dsh-plugin-manager`（其 bundle patch 插入 `id: pmgr`）
+ profile `cordis.patch.yml` 里再 `insert: - id: pmgr`。0.1.2 启动即抛：

```
dsh: plugin tree failed to load: duplicate loader entry id: pmgr
```

正确写法是**覆盖**而不是二次插入（patch 里带 `id` 且不带 `insert` 就是覆盖该行）：

```yaml
- id: pmgr
  config:
    profile: alpha-web
```

（README 旧的配置示例给的是 `insert` 写法，已在 0.7.0 一并改掉。）

### 8.6 验证方法

在 `_alpha-test` 下复制一份 `DSH_HOME`，用 **0.1.2 的 dsh** 起临时实例实测，避免动到正在跑的进程：

```bash
cp -R dshhome dshhome-verify && rm -rf dshhome-verify/sessions dshhome-verify/storages
DSH_HOME="$PWD/dshhome-verify" node_modules/.bin/dsh --profile alpha-web --port 3099 --no-open
curl -s http://127.0.0.1:3099/pmgr/list
```

结果：`counts.total 4 → 160`，`mounted 159`，`withPresets 32`，manager 自身 `entryIds:["pmgr"], fiberPhase:"active"`；
并从服务端下发的 boot graph 确认本插件行的 `inject` 已是 `["@deepseek-ai/dsh-client-ui-renderer","@deepseek-ai/dsh-client-locale"]`。

// dsh-plugin-manager — Host 入口
// 通过 webServer 前缀路由 /pmgr 提供 HTTP API，
// 客户端用浏览器 fetch 调用；插件零外部依赖，可放在任意本地路径。
import { NAME, ROUTE_PREFIX, DEFAULT_PROFILE } from './constants.ts'
import { createHandler } from './handlers.ts'

export const name = NAME
export const inject = ['webServer']

interface BootCtx {
  get(name: string): unknown
  effect(cb: () => unknown, label?: string): unknown
}

interface WebServer {
  register(route: { kind: string; path: string; handler: (req: never, res: never) => Promise<void> | void }): unknown
}

export function apply(ctx: BootCtx, config?: Record<string, unknown>): void {
  const profile = (config && typeof config.profile === 'string' && config.profile) || DEFAULT_PROFILE
  const webServer = ctx.get('webServer') as WebServer | undefined
  if (webServer === undefined) {
    console.log(NAME + ': webServer 不可用，跳过路由注册')
    return
  }
  ctx.effect(() => {
    const route = {
      kind: 'prefix',
      path: ROUTE_PREFIX,
      handler: createHandler(ctx, profile),
    }
    return webServer.register(route)
  }, NAME + ': routes')
  console.log(NAME + ': host ready (profile=' + profile + ', routes=' + ROUTE_PREFIX + '/*)')
}

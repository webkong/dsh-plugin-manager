// dsh-plugin-manager — Host 入口
// 通过 webServer 前缀路由 /pmgr 提供 HTTP API（与 @deepseek-ai/dsh-plugin-console 同方案），
// 客户端用浏览器 fetch 调用；插件零外部依赖，可放在任意本地路径。
import { NAME, ROUTE_PREFIX, DEFAULT_PROFILE } from './constants.js'
import { createHandler } from './handlers.js'

export const name = NAME
export const inject = ['webServer']

export function apply(ctx, config) {
  const profile = (config && config.profile) || DEFAULT_PROFILE
  const webServer = ctx.get('webServer')
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

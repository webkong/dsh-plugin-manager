// HTTP 请求分发：/pmgr/list + /pmgr/{install|uninstall|stop|start}
import { isLoopback, sendJson, sendError, readBody } from './http.js'
import { createManager } from './manager.js'
import { createShell } from './shell.js'

export function createHandler(ctx, profile) {
  const shellTools = createShell(ctx)
  const manager = createManager(ctx, profile, shellTools)

  return async (req, res) => {
    if (!isLoopback(req.socket?.remoteAddress ?? '')) {
      sendError(res, 403, '仅允许本机访问')
      return
    }
    try {
      const url = new URL(req.url ?? '/', 'http://x')
      const pathname = url.pathname
      const method = req.method ?? 'GET'
      if (method === 'GET' && pathname === '/pmgr/list') {
        sendJson(res, 200, await manager.list())
        return
      }
      if (method !== 'POST') {
        sendError(res, 405, 'method not allowed')
        return
      }
      const body = await readBody(req)
      if (pathname === '/pmgr/install') {
        sendJson(res, 200, await manager.install(body.spec))
      } else if (pathname === '/pmgr/uninstall') {
        sendJson(res, 200, await manager.uninstall(body.name))
      } else if (pathname === '/pmgr/stop') {
        sendJson(res, 200, await manager.stop(body.name))
      } else if (pathname === '/pmgr/start') {
        sendJson(res, 200, await manager.start(body.name))
      } else {
        sendError(res, 404, 'not found')
      }
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : String(error))
    }
  }
}

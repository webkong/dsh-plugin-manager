// HTTP 请求分发：/pmgr/list + /pmgr/{install|uninstall|stop|start}
import { isLoopback, sendJson, sendError, readBody } from './http.js'
import { createManager } from './manager.js'
import {
  readText,
  writeText,
  readManifest,
  updateManifest,
  execBash,
  profilePath,
  findDshPkgDir,
  dshHome,
} from './fsutil.js'

export function createHandler(ctx, profile, options = {}) {
  const fsTools = { readText, writeText, readManifest, updateManifest, execBash, profilePath, findDshPkgDir, dshHome }
  const manager = createManager(ctx, profile, fsTools, options.autoRestart !== false)

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
      const str = (v) => (typeof v === 'string' ? v : '')
      if (pathname === '/pmgr/install') {
        const spec = str(body.spec)
        if (!spec.trim()) { sendError(res, 400, '缺少插件标识'); return }
        sendJson(res, 200, await manager.install(spec))
      } else if (pathname === '/pmgr/uninstall') {
        const name = str(body.name)
        if (!name.trim()) { sendError(res, 400, '缺少插件名'); return }
        sendJson(res, 200, await manager.uninstall(name))
      } else if (pathname === '/pmgr/stop') {
        const name = str(body.name)
        if (!name.trim()) { sendError(res, 400, '缺少插件名'); return }
        sendJson(res, 200, await manager.stop(name))
      } else if (pathname === '/pmgr/start') {
        const name = str(body.name)
        if (!name.trim()) { sendError(res, 400, '缺少插件名'); return }
        sendJson(res, 200, await manager.start(name))
      } else {
        sendError(res, 404, 'not found')
      }
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : String(error))
    }
  }
}

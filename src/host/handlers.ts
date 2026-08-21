// HTTP 请求分发：/pmgr/list + /pmgr/{install|uninstall|stop|start}
import { isLoopback, sendJson, sendError, readBody } from './http.ts'
import { validateSpec } from './spec.ts'
import { createManager, type FsTools } from './manager.ts'
import {
  readText,
  writeText,
  readManifest,
  updateManifest,
  execBash,
  profilePath,
  findDshPkgDir,
  dshHome,
  readSettings,
  writeSettings,
} from './fsutil.ts'

interface HandlerCtx {
  get(name: string): unknown
}

interface Req {
  method?: string
  url?: string
  socket?: { remoteAddress?: string }
  [Symbol.asyncIterator](): AsyncIterator<Buffer | Uint8Array>
}

interface Res {
  writeHead(status: number, headers: Record<string, string>): void
  end(payload: string): void
}

export function createHandler(ctx: HandlerCtx, profile: string) {
  const fsTools: FsTools = { readText, writeText, readManifest, updateManifest, execBash, profilePath, findDshPkgDir, dshHome, readSettings, writeSettings }
  const manager = createManager(ctx, profile, fsTools)

  return async (req: Req, res: Res): Promise<void> => {
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
      const str = (v: unknown) => (typeof v === 'string' ? v : '')
      if (pathname === '/pmgr/install') {
        const spec = str(body.spec).trim()
        const check = validateSpec(spec)
        if (!check.ok) { sendError(res, 400, check.error); return }
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
      } else if (pathname === '/pmgr/search') {
        sendJson(res, 200, await manager.search(body.q))
      } else if (pathname === '/pmgr/resolve') {
        sendJson(res, 200, await manager.resolve(body.name))
      } else if (pathname === '/pmgr/settings') {
        sendJson(res, 200, await manager.setSettings({ autoRestart: body.autoRestart === true }))
      } else if (pathname === '/pmgr/restart') {
        sendJson(res, 200, await manager.restart())
      } else {
        sendError(res, 404, 'not found')
      }
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : String(error))
    }
  }
}

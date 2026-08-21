// 浏览器侧 HTTP 调用：webServer /pmgr 前缀路由（同源 fetch）

/** /pmgr 返回的通用信封 */
export interface PmgrEnvelope {
  ok: boolean
  message?: string
  output?: string
  restarting?: boolean
  [key: string]: unknown
}

export async function call(path: string, body?: unknown): Promise<any> {
  const response = await fetch(path, body === undefined
    ? {}
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  let data: any = null
  try {
    data = await response.json()
  } catch { /* 非 JSON 响应 */ }
  if (!response.ok) {
    throw new Error(data !== null && typeof data.error === 'string' ? data.error : 'HTTP ' + response.status)
  }
  return data
}

// 各方法接收「请求体对象」直接透传（如 { name } / { spec }），避免二次包装
export const pmgr = {
  list: () => call('/pmgr/list'),
  install: (payload: unknown) => call('/pmgr/install', payload),
  uninstall: (payload: unknown) => call('/pmgr/uninstall', payload),
  stop: (payload: unknown) => call('/pmgr/stop', payload),
  start: (payload: unknown) => call('/pmgr/start', payload),
  setSettings: (payload: unknown) => call('/pmgr/settings', payload),
  search: (payload: unknown) => call('/pmgr/search', payload),
  resolve: (payload: unknown) => call('/pmgr/resolve', payload),
  restart: () => call('/pmgr/restart', {}),
}

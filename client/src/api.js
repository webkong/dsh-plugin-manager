// 浏览器侧 HTTP 调用：webServer /pmgr 前缀路由（同源 fetch）
export async function call(path, body) {
  const response = await fetch(path, body === undefined
    ? {}
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  let data = null;
  try {
    data = await response.json();
  } catch {}
  if (!response.ok) {
    throw new Error(data !== null && typeof data.error === 'string' ? data.error : 'HTTP ' + response.status);
  }
  return data;
}

// 各方法接收「请求体对象」直接透传（如 { name } / { spec }），避免二次包装
export const pmgr = {
  list: () => call('/pmgr/list'),
  install: (payload) => call('/pmgr/install', payload),
  uninstall: (payload) => call('/pmgr/uninstall', payload),
  stop: (payload) => call('/pmgr/stop', payload),
  start: (payload) => call('/pmgr/start', payload),
  setSettings: (payload) => call('/pmgr/settings', payload),
  search: (payload) => call('/pmgr/search', payload),
  restart: () => call('/pmgr/restart', {}),
};

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

export const pmgr = {
  list: () => call('/pmgr/list'),
  install: (spec) => call('/pmgr/install', { spec }),
  uninstall: (name) => call('/pmgr/uninstall', { name }),
  stop: (name) => call('/pmgr/stop', { name }),
  start: (name) => call('/pmgr/start', { name }),
};

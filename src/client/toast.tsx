// 重启完成后的 toast：localStorage 标记 + shell.overlay 浮层渲染，带「去查看」尽力跳转
import React from 'react'
import type { Translate } from './i18n.ts'

export const RESTART_TOAST_KEY = 'dsh-plugin-manager:restart-toast'

// 触发重启前写入标记，页面刷新后据此显示 toast
export function markRestartPending(): void {
  try {
    localStorage.setItem(RESTART_TOAST_KEY, '1')
  } catch { /* 存储不可用时静默 */ }
}

// 轮询等待元素出现（最多 timeout 毫秒）
function waitForSelector(selector: string, timeout = 3000): Promise<Element | null> {
  return new Promise((resolve) => {
    const started = Date.now()
    const check = (): void => {
      let el: Element | null = null
      try { el = document.querySelector(selector) } catch { /* 忽略 */ }
      if (el) { resolve(el); return }
      if (Date.now() - started >= timeout) { resolve(null); return }
      setTimeout(check, 100)
    }
    check()
  })
}

// 尽力跳转到「设置 → 插件 → 插件管理」：DOM 模拟点击，任一步失败静默返回 false
async function jumpToPluginTab(): Promise<boolean> {
  try {
    // 1) 打开设置面板（侧边栏设置按钮 aria-haspopup="dialog"）
    const trigger = document.querySelector('button[aria-haspopup="dialog"]')
    if (!trigger) return false
    ;(trigger as HTMLElement).click()
    const dialog = await waitForSelector('[role="dialog"][aria-modal="true"]')
    if (!dialog) return false
    // 2) 切到「插件」section（按导航文字匹配，兼容中英文）
    const sectionButtons = Array.from(dialog.querySelectorAll('nav button'))
    const pluginSection = sectionButtons.find((b) => {
      const txt = (b.textContent || '').trim()
      return txt.includes('插件') || txt.includes('Plugins')
    })
    if (!pluginSection) return false
    ;(pluginSection as HTMLElement).click()
    // 3) 切到「插件管理」tab（id 后缀固定为 -tab-pm-manage）
    const tab = await waitForSelector('[id$="-tab-pm-manage"]')
    if (!tab) return false
    ;(tab as HTMLElement).click()
    return true
  } catch {
    return false
  }
}

// 页面加载时若存在标记则显示 toast，8 秒后自动消失
export function RestartToast({ t }: { t: Translate }): React.ReactElement | null {
  const [visible, setVisible] = React.useState<boolean>(() => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(RESTART_TOAST_KEY) === '1') {
        localStorage.removeItem(RESTART_TOAST_KEY)
        return true
      }
    } catch { /* 忽略 */ }
    return false
  })

  React.useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  const handleJump = (): void => {
    void jumpToPluginTab()
    setVisible(false)
  }

  return React.createElement(
    'div',
    { className: 'pmgr-toast', role: 'status' },
    React.createElement('span', { className: 'pmgr-toast-text' }, t('restartToast')),
    React.createElement('button', { className: 'pmgr-toast-action', onClick: handleJump }, t('goView')),
    React.createElement('button', { className: 'pmgr-toast-close', onClick: () => setVisible(false), 'aria-label': '×' }, '×'),
  )
}

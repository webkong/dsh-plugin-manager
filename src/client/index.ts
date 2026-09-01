// Client 入口：注入样式、注册 locale 字典、注册「设置 → 插件 → 插件管理」标签页
// 模块组织参考官方 ui 插件：入口只做装配，业务组件在 components.tsx / ui.tsx / toast.tsx
import React from 'react'
import { injectStyles } from './styles.ts'
import { PluginManagerTab } from './ui.tsx'
import { RestartToast } from './toast.tsx'
import { zh, en } from './i18n.ts'
import type { Translate } from './i18n.ts'

export const NS = 'settings.pluginManager'
export const inject = ['slots', 'locale']

interface ClientCtx {
  get(name: string): unknown
  effect(cb: () => unknown, label?: string): unknown
  locale: {
    register(ns: string, dicts: Record<string, Record<string, string>>): () => void
    bind(ns: string): Translate
  }
  slots?: SlotReg
}

interface SlotReg {
  inject(key: string, cb: () => unknown): unknown
  register(options: Record<string, unknown>, component: unknown): unknown
}

export function apply(ctx: ClientCtx): void {
  injectStyles()
  ctx.effect(
    () => ctx.locale.register(NS, { zh: zh as Record<string, string>, en: en as Record<string, string> }),
    'dsh-plugin-manager: dictionaries',
  )
  const t = ctx.locale.bind(NS)

  // slots 是上面 inject 声明的硬依赖：Cordis 保证 apply 时已激活，服务重载会重新 apply，
  // 所以直接用注入面；只在极端情况下退回 ctx.get，并且出声告警——
  // 客户端服务异步激活时若静默缓存成 undefined，表现就是「界面不出现 / 点击没反应且无报错」。
  const slots = ctx.slots ?? (ctx.get('slots') as SlotReg | undefined)
  if (slots === undefined) {
    console.error('dsh-plugin-manager: slots 服务不可用，跳过插件管理页注册')
    return
  }

  slots.inject('settings.plugins.tab', () =>
    slots.register(
      {
        name: 'settings.plugins.tab',
        id: 'pm-manage',
        order: 20,
        label: () => t('tabLabel'),
      },
      () => React.createElement(PluginManagerTab, { t }),
    ),
  )

  // 重启完成后的 toast（帧级浮层，自动消失）
  slots.inject('shell.overlay', () =>
    slots.register(
      {
        name: 'shell.overlay',
        id: 'pmgr-restart-toast',
        order: 100,
        label: 'dsh-plugin-manager',
      },
      () => React.createElement(RestartToast, { t }),
    ),
  )
}

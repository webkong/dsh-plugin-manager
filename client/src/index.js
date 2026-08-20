// Client 入口：注入样式、注册 locale 字典、注册「设置 → 插件 → 插件管理」标签页
import React from 'react';
import { injectStyles } from './styles.js';
import { PluginManagerTab } from './ui.js';
import { RestartToast } from './toast.js';
import { zh, en } from './i18n.js';

export const NS = 'settings.pluginManager';
export const inject = ['slots', 'locale'];

export function apply(ctx) {
  injectStyles();
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-plugin-manager: dictionaries');
  const t = ctx.locale.bind(NS);

  const slots = ctx.get('slots');
  if (slots === undefined) return;
  slots.inject('settings.plugins.tab', () =>
    slots.register(
      {
        name: 'settings.plugins.tab',
        id: 'pm-manage',
        order: 20,
        label: () => t('tabLabel'),
      },
      () => React.createElement(PluginManagerTab, { t })
    )
  );

  // 重启完成后的 toast（帧级浮层，自动消失）
  slots.inject('shell.overlay', () =>
    slots.register(
      {
        name: 'shell.overlay',
        id: 'pmgr-restart-toast',
        order: 100,
        label: 'dsh-plugin-manager',
      },
      () => React.createElement(RestartToast, { t })
    )
  );
}

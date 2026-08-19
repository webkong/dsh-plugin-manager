// Client 入口：注入样式、注册「设置 → 插件 → 插件管理」标签页
import React from 'react';
import { injectStyles } from './styles.js';
import { PluginManagerTab } from './ui.js';

export const inject = ['slots'];

export function apply(ctx) {
  injectStyles();
  const slots = ctx.get('slots');
  if (slots === undefined) return;
  slots.inject('settings.plugins.tab', () =>
    slots.register(
      {
        name: 'settings.plugins.tab',
        id: 'pm-manage',
        order: 20,
        label: () => '插件管理',
      },
      () => React.createElement(PluginManagerTab, null)
    )
  );
}

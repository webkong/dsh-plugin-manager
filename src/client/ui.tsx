import type { Translate } from './i18n.ts'
import type { ListResult, PluginView, ModalState, ConfirmState, LoadingState } from './types.ts'
// 插件管理页主组件：编排头部 / 状态筛选 / 工具栏 / 插件列表 / 安装弹窗 / 操作弹窗
import React from 'react'
import { pmgr } from './api.ts'
import { markRestartPending } from './toast.tsx'
import { StatusTabs, PluginToolbar, InstallDialog, PluginCard } from './components.tsx'

export function PluginManagerTab(props: { t: Translate }): React.ReactElement {
  const { t } = props;
  const [state, setState] = React.useState<{ loading: boolean; error: string | null; data: ListResult | null }>({ loading: true, error: null, data: null });
  const [busy, setBusy] = React.useState<string | null>(null);
  const [modal, setModal] = React.useState<ModalState | null>(null);
  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const [loading, setLoading] = React.useState<LoadingState | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sourceFilter, setSourceFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [builtinOpen, setBuiltinOpen] = React.useState(false);
  const [installOpen, setInstallOpen] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);

  const refresh = (silent: boolean): void => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    pmgr.list()
      .then((data: ListResult) => setState({ loading: false, error: null, data }))
      .catch((e: unknown) => setState({ loading: false, error: String((e as Error).message || e), data: null }));
  };

  React.useEffect(() => {
    refresh(true);
  }, []);

  // 重启倒计时：每 1s 减一，到 0 自动刷新页面
  React.useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      try { window.location.reload(); } catch {}
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const d = state.data;
  const plugins = d && d.plugins ? d.plugins : [];
  const autoRestart = !!(d && d.settings && d.settings.autoRestart);

  const act = (method: 'install' | 'uninstall' | 'stop' | 'start' | 'restart', args: unknown, label: string, loadingText?: string) => {
    setBusy(label);
    setModal(null);
    if (loadingText) setLoading({ label: loadingText });
    pmgr[method](args)
      .then((data: { ok?: boolean; restarting?: boolean; message?: string; output?: string | null }) => {
        const opName = t(method === 'install' ? 'opInstall' : method === 'uninstall' ? 'opUninstall' : method === 'stop' ? 'opStop' : method === 'start' ? 'opStart' : 'opRestart');
        if (data && data.ok) {
          if (data.restarting) {
            setModal({ kind: 'ok', op: method, title: opName + ' ' + t('success'), text: data.message || '', output: data.output || null });
            markRestartPending();
            setCountdown(10);
          } else {
            setModal({ kind: 'ok', op: method, title: opName + ' ' + t('success'), text: data.message || t('ok'), output: data.output || null, pendingRestart: method === 'install' || method === 'uninstall' });
            refresh(true);
          }
        } else {
          setModal({ kind: 'err', op: method, title: opName + ' ' + t('failed'), text: (data && data.message) || t('opFailed'), output: (data && data.output) || null });
        }
      })
      .catch((e: unknown) => setModal({ kind: 'err', title: t('opFailed'), text: String((e as Error).message || e), output: null }))
      .finally(() => {
        setBusy(null);
        setLoading(null);
      });
  };

  const toggleAutoRestart = () => {
    setBusy('settings');
    pmgr.setSettings({ autoRestart: !autoRestart })
      .then((res: { ok?: boolean; settings?: { autoRestart: boolean } } | null) => {
        if (res && res.ok && res.settings) setState((prev) => ({ ...prev, data: { ...(prev.data ?? {}), settings: res.settings } as ListResult }));
      })
      .catch(() => {})
      .finally(() => setBusy(null));
  };

  const doRestartNow = () => {
    setModal(null);
    setBusy('restart');
    pmgr.restart()
      .then((res: { ok?: boolean; message?: string } | null) => {
        if (res && res.ok) {
          setModal({ kind: 'ok', title: t('opRestart'), text: res.message || t('restarting'), output: null });
          markRestartPending();
          setCountdown(10);
        } else setModal({ kind: 'err', title: t('opRestart') + ' ' + t('failed'), text: (res && res.message) || t('restartFailed'), output: null });
      })
      .catch((e: unknown) => setModal({ kind: 'err', title: t('opRestart') + ' ' + t('failed'), text: String((e as Error).message || e), output: null }))
      .finally(() => setBusy(null));
  };

  const doReload = () => {
    try {
      window.location.reload();
    } catch {
      setModal(null);
    }
  };

  // 卡片操作
  const confirmStop = (name: string) => setConfirm({ title: t('opStop'), message: t('confirmStop', { name }), onConfirm: () => act('stop', { name }, name) });
  const confirmUninstall = (name: string) => setConfirm({ title: t('opUninstall'), message: t('confirmUninstall', { name }), onConfirm: () => act('uninstall', { name }, name, t('uninstalling')) });
  const doStart = (name: string) => act('start', { name }, name);
  const doInstall = (spec: string) => {
    setInstallOpen(false);
    act('install', { spec }, 'install', t('installing'));
  };

  // 统计（互斥分桶）
  const counts = {
    all: plugins.length,
    running: plugins.filter((p) => p.mounted && p.enabled && !p.missing).length,
    stopped: plugins.filter((p) => !p.enabled && !p.missing).length,
    error: plugins.filter((p) => p.missing).length,
  };

  // 筛选：状态 → 来源 → 搜索
  const filtered = plugins
    .filter((p: PluginView) => {
      if (statusFilter === 'running' && !(p.mounted && p.enabled && !p.missing)) return false;
      if (statusFilter === 'stopped' && !(!p.enabled && !p.missing)) return false;
      if (statusFilter === 'error' && !p.missing) return false;
      return true;
    })
    .filter((p: PluginView) => {
      if (sourceFilter === 'builtin' && p.kind !== 'builtin') return false;
      if (sourceFilter === 'third-party' && p.kind !== 'third-party') return false;
      if (sourceFilter === 'npm' && p.source !== 'npm') return false;
      if (sourceFilter === 'local' && p.source !== 'local') return false;
      if (sourceFilter === 'github' && p.source !== 'github') return false;
      return true;
    })
    .filter((p: PluginView) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return [p.name, p.description, p.source, p.spec, p.kind].some((v) => String(v || '').toLowerCase().includes(q));
    });

  const third = filtered.filter((p) => p.kind === 'third-party');
  const builtin = filtered.filter((p) => p.kind === 'builtin');

  const renderSection = (title: string, list: PluginView[], open: boolean, onToggle: () => void) =>
    React.createElement(
      'div',
      { className: 'pmgr-group' },
      React.createElement(
        'div',
        { className: 'pmgr-group-head', onClick: onToggle },
        React.createElement('h3', { className: 'pmgr-group-title' }, title + ' ' + list.length),
        React.createElement('span', { className: 'pmgr-group-toggle' }, open ? t('collapse') : t('expand'))
      ),
      open
        ? list.length
          ? React.createElement('div', { className: 'pmgr-group' }, list.map((p) => React.createElement(PluginCard, { key: p.name, t, p, busy, onStop: () => confirmStop(p.name), onStart: () => doStart(p.name), onUninstall: () => confirmUninstall(p.name) })))
          : React.createElement('div', { className: 'pmgr-empty' }, t('noResults'))
        : null
    );

  return React.createElement(
    'div',
    { className: 'pmgr-root' },
    // 头部：标题 + profile + 刷新
    React.createElement(
      'div',
      { className: 'pmgr-head' },
      React.createElement('h2', { className: 'pmgr-title' }, t('tabLabel')),
      React.createElement(
        'button',
        { className: 'pmgr-btn', disabled: state.loading, onClick: () => refresh(false) },
        t('refresh')
      )
    ),
    d && d.profile
      ? React.createElement('div', { className: 'pmgr-profile', title: d.profileDir }, t('currentProfile') + '：' + d.profile)
      : null,
    // 状态筛选 Tabs
    React.createElement(StatusTabs, { t, counts, active: statusFilter, onChange: setStatusFilter }),
    // 工具栏
    React.createElement(PluginToolbar, {
      t,
      search: searchQuery,
      onSearch: setSearchQuery,
      source: sourceFilter,
      onSource: setSourceFilter,
      onInstall: () => setInstallOpen(true),
    }),
    state.error ? React.createElement('div', { className: 'pmgr-notice err' }, String(state.error)) : null,
    state.loading && !state.data ? React.createElement('div', { className: 'pmgr-empty' }, t('loading')) : null,
    // 插件列表：三方优先，内置可折叠
    renderSection(t('groupThird'), third, true, () => {}),
    renderSection(t('groupBuiltin'), builtin, builtinOpen, () => setBuiltinOpen(!builtinOpen)),
    // 安装弹窗
    React.createElement(InstallDialog, {
      t,
      open: installOpen,
      onClose: () => setInstallOpen(false),
      autoRestart,
      onToggleAutoRestart: toggleAutoRestart,
      busy,
      onInstall: doInstall,
    }),
    // loading 弹窗
    loading
      ? React.createElement(
          'div',
          { className: 'pmgr-modal-backdrop' },
          React.createElement(
            'div',
            { className: 'pmgr-modal pmgr-modal-loading' },
            React.createElement('span', { className: 'pmgr-spinner' }),
            React.createElement('p', { className: 'pmgr-modal-text' }, loading.label)
          )
        )
      : null,
    // 二次确认弹窗
    confirm
      ? React.createElement(
          'div',
          { className: 'pmgr-modal-backdrop', onClick: () => setConfirm(null) },
          React.createElement(
            'div',
            { className: 'pmgr-modal', onClick: (e: React.MouseEvent) => e.stopPropagation() },
            React.createElement('div', { className: 'pmgr-modal-head' },
              React.createElement('h3', { className: 'pmgr-modal-title' }, confirm.title),
              React.createElement('button', { className: 'pmgr-modal-close', onClick: () => setConfirm(null), 'aria-label': '×' }, '×')
            ),
            React.createElement('div', { className: 'pmgr-modal-body' },
              React.createElement('p', { className: 'pmgr-modal-text' }, confirm.message)
            ),
            React.createElement('div', { className: 'pmgr-modal-actions' },
              React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm danger', onClick: () => { setConfirm(null); confirm.onConfirm(); } }, t('ok'))
            )
          )
        )
      : null,
    // 结果弹窗
    modal
      ? React.createElement(
          'div',
          { className: 'pmgr-modal-backdrop', onClick: () => setModal(null) },
          React.createElement(
            'div',
            { className: 'pmgr-modal' + (modal.kind === 'err' ? ' err' : ''), onClick: (e: React.MouseEvent) => e.stopPropagation() },
            React.createElement('div', { className: 'pmgr-modal-head' },
              React.createElement('h3', { className: 'pmgr-modal-title' }, modal.title),
              React.createElement('button', { className: 'pmgr-modal-close', onClick: () => setModal(null), 'aria-label': '×' }, '×')
            ),
            React.createElement('div', { className: 'pmgr-modal-body' },
              React.createElement('p', { className: 'pmgr-modal-text' }, modal.text),
              countdown !== null ? React.createElement('p', { className: 'pmgr-countdown' }, t('autoRefreshIn', { n: countdown })) : null,
              modal.output ? React.createElement('pre', { className: 'pmgr-output' }, modal.output) : null
            ),
            React.createElement('div', { className: 'pmgr-modal-actions' },
              modal.kind === 'ok' && modal.op === 'uninstall'
                ? React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm', onClick: doReload }, t('refresh'))
                : null,
              modal.pendingRestart ? React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm', onClick: doRestartNow, disabled: busy !== null }, t('restartNow')) : null,
              React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm', onClick: () => setModal(null) }, t('ok'))
            )
          )
        )
      : null
  );
}

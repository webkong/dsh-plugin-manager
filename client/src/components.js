// 插件管理页子组件：状态 Tabs / Toolbar / 安装弹窗 / 插件卡片（含 ••• 菜单）
import React from 'react';
import { pmgr } from './api.js';
import { validateSpec } from './spec.js';

// 卡片运行时状态：●运行中 / 已停用 / ●加载失败
export function RuntimeState(props) {
  const { t, p } = props;
  if (p.missing) {
    return React.createElement('span', { className: 'pmgr-state pmgr-state-error' }, '● ' + t('stateFailed'));
  }
  if (p.enabled) {
    return React.createElement('span', { className: 'pmgr-state pmgr-state-running' }, '● ' + t('stateRunning'));
  }
  return React.createElement('span', { className: 'pmgr-state pmgr-state-stopped' }, t('stateStopped'));
}

// 状态筛选 Tabs
export function StatusTabs(props) {
  const { t, counts, active, onChange } = props;
  const tabs = [
    ['all', t('statusAll'), counts.all],
    ['running', t('statusRunning'), counts.running],
    ['stopped', t('statusStopped'), counts.stopped],
    ['error', t('statusError'), counts.error],
  ];
  return React.createElement(
    'div',
    { className: 'pmgr-tabs' },
    tabs.map(([key, label, count]) =>
      React.createElement(
        'button',
        { key: key, className: 'pmgr-tab' + (active === key ? ' active' : ''), onClick: () => onChange(key) },
        label + ' ' + count
      )
    )
  );
}

// 工具栏：搜索 + 来源筛选 + 安装插件
export function PluginToolbar(props) {
  const { t, search, onSearch, source, onSource, onInstall } = props;
  const sources = [
    ['all', t('sourceAll')],
    ['builtin', t('sourceBuiltin')],
    ['third-party', t('sourceThird')],
    ['npm', t('sourceNpm')],
    ['local', t('sourceLocal')],
    ['github', t('sourceGithub')],
  ];
  return React.createElement(
    'div',
    { className: 'pmgr-toolbar' },
    React.createElement('input', {
      className: 'pmgr-input pmgr-toolbar-search',
      placeholder: t('searchInstalled'),
      value: search,
      onChange: (e) => onSearch(e.target.value),
    }),
    React.createElement(
      'select',
      { className: 'pmgr-select', value: source, onChange: (e) => onSource(e.target.value) },
      sources.map(([k, l]) => React.createElement('option', { key: k, value: k }, l))
    ),
    React.createElement('button', { className: 'pmgr-btn pmgr-btn-primary', onClick: onInstall }, '+ ' + t('installPlugin'))
  );
}

// 安装弹窗：直接安装 / 搜索 GitHub
export function InstallDialog(props) {
  const { t, open, onClose, autoRestart, onToggleAutoRestart, busy, onInstall } = props;
  const [mode, setMode] = React.useState('direct');
  const [spec, setSpec] = React.useState('');
  const [err, setErr] = React.useState('');
  const [gq, setGq] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [searching, setSearching] = React.useState(false);

  if (!open) return null;

  const doInstall = () => {
    const check = validateSpec(spec);
    if (!check.ok) {
      setErr(check.error);
      return;
    }
    setErr('');
    onInstall(spec.trim());
  };

  const doSearch = () => {
    setSearching(true);
    pmgr.search({ q: gq })
      .then((d) => setResults(d))
      .catch((e) => setResults({ ok: false, message: String((e && e.message) || e), items: [] }))
      .finally(() => setSearching(false));
  };

  return React.createElement(
    'div',
    { className: 'pmgr-modal-backdrop', onClick: onClose },
    React.createElement(
      'div',
      { className: 'pmgr-modal pmgr-install-dialog', onClick: (e) => e.stopPropagation() },
      React.createElement(
        'div',
        { className: 'pmgr-modal-head' },
        React.createElement('h3', { className: 'pmgr-modal-title' }, t('installTitle')),
        React.createElement('button', { className: 'pmgr-modal-close', onClick: onClose, 'aria-label': '×' }, '×')
      ),
      React.createElement(
        'div',
        { className: 'pmgr-install-tabs' },
        React.createElement('button', { className: 'pmgr-install-tab' + (mode === 'direct' ? ' active' : ''), onClick: () => setMode('direct') }, t('installDirect')),
        React.createElement('button', { className: 'pmgr-install-tab' + (mode === 'github' ? ' active' : ''), onClick: () => setMode('github') }, t('installGithub'))
      ),
      mode === 'direct'
        ? React.createElement(
            'div',
            { className: 'pmgr-install-form' },
            React.createElement('label', { className: 'pmgr-field-label' }, t('specLabel')),
            React.createElement('input', {
              className: 'pmgr-input',
              placeholder: t('specPlaceholder'),
              value: spec,
              autoFocus: true,
              onChange: (e) => setSpec(e.target.value),
              onKeyDown: (e) => {
                if (e.key === 'Enter') doInstall();
              },
            }),
            err ? React.createElement('div', { className: 'pmgr-notice err' }, err) : null,
            React.createElement(
              'label',
              { className: 'pmgr-check' },
              React.createElement('input', { type: 'checkbox', checked: autoRestart, onChange: onToggleAutoRestart }),
              React.createElement('span', null, t('restartAfterInstall'))
            )
          )
        : React.createElement(
            'div',
            { className: 'pmgr-install-form' },
            React.createElement(
              'div',
              { className: 'pmgr-install' },
              React.createElement('input', {
                className: 'pmgr-input',
                placeholder: t('searchGithubPlaceholder'),
                value: gq,
                onChange: (e) => setGq(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === 'Enter') doSearch();
                },
              }),
              React.createElement('button', { className: 'pmgr-btn', disabled: searching, onClick: doSearch }, searching ? t('searching') : t('searchBtn'))
            ),
            results && results.ok && Array.isArray(results.items) && results.items.length > 0
              ? React.createElement(
                  'div',
                  { className: 'pmgr-search-results' },
                  results.items.map((r) =>
                    React.createElement(
                      'div',
                      { key: r.fullName, className: 'pmgr-search-item' },
                      React.createElement(
                        'div',
                        { className: 'pmgr-search-item-info' },
                        React.createElement('a', { className: 'pmgr-search-item-name', href: r.htmlUrl, target: '_blank', rel: 'noreferrer', title: r.fullName }, r.fullName),
                        React.createElement('span', { className: 'pmgr-search-item-stars' }, '⭐ ' + r.stars),
                        r.description ? React.createElement('p', { className: 'pmgr-search-item-desc' }, r.description) : null
                      ),
                      React.createElement(
                        'button',
                        { className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: () => onInstall('github:' + r.fullName + '#' + r.defaultBranch) },
                        t('install')
                      )
                    )
                  )
                )
              : null,
            results && results.ok && results.items && results.items.length === 0
              ? React.createElement('div', { className: 'pmgr-empty' }, t('noResults'))
              : null,
            results && !results.ok
              ? React.createElement('div', { className: 'pmgr-notice err' }, results.message)
              : null
          ),
      React.createElement(
        'div',
        { className: 'pmgr-modal-actions' },
        React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm', onClick: onClose }, t('cancel')),
        mode === 'direct'
          ? React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm primary', disabled: busy !== null, onClick: doInstall }, busy === 'install' ? t('installing') : t('install'))
          : null
      )
    )
  );
}

// 插件卡片：名称+状态 / 元数据 / 描述 / 操作（主要按钮 + ••• 菜单）
export function PluginCard(props) {
  const { t, p, busy, onStop, onStart, onLoad, onUninstall } = props;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const sourceLabel = p.source === 'github' ? t('sourceGithub') : p.source === 'npm' ? t('sourceNpm') : p.source === 'local' ? t('sourceLocal') : '';
  const kindLabel = p.kind === 'builtin' ? t('kindBuiltin') : t('kindThird');
  const meta = [p.version, sourceLabel, kindLabel].filter(Boolean).join(' · ');

  const primary = [];
  if (p.kind === 'third-party') {
    if (p.mounted && p.enabled) {
      primary.push(React.createElement('button', { key: 'stop', className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: onStop }, t('actionStop')));
    } else if (p.mounted && !p.enabled) {
      primary.push(React.createElement('button', { key: 'start', className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: onStart }, t('actionStart')));
    } else if (p.isBundle && p.installed) {
      primary.push(React.createElement('button', { key: 'load', className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: onLoad }, t('actionLoad')));
    }
  }

  const menuItems = [];
  if (p.githubUrl) {
    menuItems.push(
      React.createElement(
        'button',
        { key: 'gh', className: 'pmgr-menu-item', onClick: () => { setMenuOpen(false); window.open(p.githubUrl, '_blank'); } },
        t('openGithub')
      )
    );
  }
  if (p.kind === 'third-party') {
    if (menuItems.length) menuItems.push(React.createElement('div', { key: 'sep', className: 'pmgr-menu-sep' }));
    menuItems.push(
      React.createElement(
        'button',
        { key: 'uninstall', className: 'pmgr-menu-item danger', onClick: () => { setMenuOpen(false); onUninstall(); } },
        t('uninstallTitle')
      )
    );
  }

  const busyThis = busy === p.name || busy === 'install';

  return React.createElement(
    'div',
    { className: 'pmgr-card' },
    React.createElement(
      'div',
      { className: 'pmgr-card-top' },
      React.createElement('span', { className: 'pmgr-name', title: p.name }, p.name),
      React.createElement(RuntimeState, { t, p })
    ),
    meta ? React.createElement('div', { className: 'pmgr-card-meta-line' }, meta) : null,
    p.description ? React.createElement('p', { className: 'pmgr-card-desc', title: p.description }, p.description) : null,
    primary.length || menuItems.length
      ? React.createElement(
          'div',
          { className: 'pmgr-card-actions' },
          primary,
          menuItems.length
            ? React.createElement(
                'div',
                { className: 'pmgr-menu' },
                React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm pmgr-menu-toggle', disabled: busy !== null, onClick: () => setMenuOpen(!menuOpen) }, '•••'),
                menuOpen ? React.createElement('div', { className: 'pmgr-menu-pop' }, menuItems) : null
              )
            : null,
          busyThis ? React.createElement('span', { className: 'pmgr-foot' }, t('processing')) : null
        )
      : null
  );
}

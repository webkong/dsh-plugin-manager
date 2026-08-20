// UI 组件：插件管理器标签页（React.createElement，无 JSX；文案经 t() 多语言）
// 卡片信息架构：Header（标题+状态+操作）/ 描述 / 来源 metadata
import React from 'react';
import { pmgr } from './api.js';

// 模糊匹配：query 字符按顺序出现在 text 中（子序列匹配，大小写不敏感）
function fuzzyMatch(text, query) {
  const t = String(text || '').toLowerCase();
  const q = String(query || '').toLowerCase();
  if (!q) return true;
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return false;
    ti = found + 1;
  }
  return true;
}

function refFromSpec(spec) {
  if (!spec) return '';
  const m = String(spec).match(/#([^@\s]+)$/);
  return m ? m[1] : '';
}

function isCommitHash(ref) {
  return /^[a-f0-9]{40}$/i.test(ref);
}

function shortRef(ref) {
  if (!ref) return '';
  return isCommitHash(ref) ? ref.slice(0, 8) : ref;
}

function repoFromUrl(url) {
  const m = String(url || '').match(/github\.com\/([^/]+\/[^/?#]+)/);
  return m ? m[1] : '';
}

function phaseText(t, phase) {
  if (phase === 'active') return t('running');
  if (phase === 'loading') return t('phaseLoading');
  if (phase === 'failed') return t('phaseFailed');
  if (phase === 'pending') return t('phasePending');
  if (phase === 'unloading') return t('phaseUnloading');
  if (phase === null || phase === undefined) return t('notRunning');
  return String(phase);
}

export function Badge(props) {
  return React.createElement('span', { className: 'pmgr-badge ' + (props.kind || '') }, props.children);
}

function RuntimeDot(props) {
  const { t, phase } = props;
  const active = phase === 'active';
  return React.createElement(
    'span',
    { className: 'pmgr-runtime' },
    React.createElement('span', { className: 'pmgr-dot' + (active ? '' : ' off') }),
    phaseText(t, phase)
  );
}

function CardMeta(props) {
  const { t, p } = props;
  const ghLink = p.githubUrl
    ? React.createElement(
        'a',
        { key: 'gh', className: 'pmgr-meta-gh', href: p.githubUrl, target: '_blank', rel: 'noreferrer', title: p.githubUrl },
        'GitHub ↗'
      )
    : null;
  const meta = [];
  if (p.source === 'github' && p.githubUrl) {
    const repo = repoFromUrl(p.githubUrl);
    const ref = refFromSpec(p.spec);
    const short = shortRef(ref);
    meta.push(
      React.createElement('span', { key: 'label', className: 'pmgr-meta-label' }, t('sourceLabel')),
      React.createElement('span', { key: 'sep1', className: 'pmgr-meta-sep' }, '·'),
      React.createElement(
        'a',
        { key: 'repo', className: 'pmgr-meta-link', href: p.githubUrl, target: '_blank', rel: 'noreferrer', title: p.githubUrl },
        'GitHub · ' + repo
      )
    );
    if (ref) {
      meta.push(
        React.createElement(
          'span',
          { key: 'ref', className: 'pmgr-meta-hash', title: isCommitHash(ref) ? t('fullCommit') + ': ' + ref : '' },
          '· ' + short
        )
      );
    }
  } else if (p.source === 'npm') {
    meta.push(
      React.createElement('span', { key: 'label', className: 'pmgr-meta-label' }, t('sourceLabel')),
      React.createElement('span', { key: 'sep1', className: 'pmgr-meta-sep' }, '·'),
      React.createElement('span', { key: 'body', className: 'pmgr-meta-hash' }, 'npm' + (p.name ? ' · ' + p.name : ''))
    );
  } else if (p.source === 'local') {
    meta.push(
      React.createElement('span', { key: 'label', className: 'pmgr-meta-label' }, t('sourceLabel')),
      React.createElement('span', { key: 'sep1', className: 'pmgr-meta-sep' }, '·'),
      React.createElement('span', { key: 'body' }, t('sourceLocal'))
    );
  }
  if (ghLink) meta.push(ghLink);
  return meta.length ? React.createElement('div', { className: 'pmgr-card-meta' }, ...meta) : null;
}

function PluginGroup(props) {
  const { t, title, count, open, onToggle, query, onQuery, plugins, renderRow } = props;
  const filtered = plugins.filter((p) => fuzzyMatch(p.name + ' ' + (p.description || ''), query));
  const running = filtered.filter((p) => !p.missing && p.enabled);
  const stopped = filtered.filter((p) => !p.missing && !p.enabled);
  const missing = filtered.filter((p) => p.missing);
  const sections = [];
  if (running.length) sections.push({ key: 'running', label: t('subRunning'), list: running });
  if (stopped.length) sections.push({ key: 'stopped', label: t('subStopped'), list: stopped });
  if (missing.length) sections.push({ key: 'missing', label: t('subMissing'), list: missing });
  return React.createElement(
    'div',
    { className: 'pmgr-group' },
    React.createElement(
      'div',
      { className: 'pmgr-group-head', onClick: onToggle },
      React.createElement('h3', { className: 'pmgr-group-title' }, title + '（' + count + '）'),
      React.createElement('span', { className: 'pmgr-group-toggle' }, open ? t('collapse') : t('expand'))
    ),
    open
      ? React.createElement(
          'div',
          { className: 'pmgr-group' },
          React.createElement('input', {
            className: 'pmgr-input pmgr-search',
            placeholder: t('searchPlaceholder', { title }),
            value: query,
            onChange: (e) => onQuery(e.target.value),
          }),
          sections.length
            ? sections.map((sec) =>
                React.createElement(
                  'div',
                  { key: sec.key, className: 'pmgr-sub' },
                  React.createElement('h4', { className: 'pmgr-sub-title' }, sec.label + '（' + sec.list.length + '）'),
                  sec.list.map(renderRow)
                )
              )
            : React.createElement('div', { className: 'pmgr-empty' }, t('noMatch'))
        )
      : null
  );
}

export function PluginManagerTab(props) {
  const { t } = props;
  const [state, setState] = React.useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = React.useState(null);
  const [spec, setSpec] = React.useState('');
  const [modal, setModal] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);
  const [loading, setLoading] = React.useState(null);
  const [thirdOpen, setThirdOpen] = React.useState(true);
  const [builtinOpen, setBuiltinOpen] = React.useState(false);
  const [thirdQuery, setThirdQuery] = React.useState('');
  const [builtinQuery, setBuiltinQuery] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState(null);
  const [searching, setSearching] = React.useState(false);

  const refresh = (silent) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    pmgr.list()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((e) => setState({ loading: false, error: String((e && e.message) || e), data: null }));
  };

  React.useEffect(() => {
    refresh(true);
  }, []);

  const d = state.data;
  const plugins = d && d.plugins ? d.plugins : [];
  const builtin = plugins.filter((p) => p.kind === 'builtin');
  const third = plugins.filter((p) => p.kind === 'third-party');

  const act = (method, args, label, loadingText) => {
    setBusy(label);
    setModal(null);
    if (loadingText) setLoading({ label: loadingText });
    pmgr[method](args)
      .then((data) => {
        const opName = t(method === 'setSettings' ? 'opRestart' : method === 'install' ? 'opInstall' : method === 'uninstall' ? 'opUninstall' : method === 'stop' ? 'opStop' : method === 'start' ? 'opStart' : 'opRestart');
        if (data && data.ok) {
          if (data.restarting) {
            setModal({ kind: 'ok', title: opName + ' ' + t('success'), text: data.message || '', output: data.output || null });
          } else {
            setModal({ kind: 'ok', title: opName + ' ' + t('success'), text: data.message || t('ok'), output: data.output || null, pendingRestart: method === 'install' || method === 'uninstall' });
            refresh(true);
          }
        } else {
          setModal({ kind: 'err', title: opName + ' ' + t('failed'), text: (data && data.message) || t('opFailed'), output: (data && data.output) || null });
        }
      })
      .catch((e) => setModal({ kind: 'err', title: t('opFailed'), text: String((e && e.message) || e), output: null }))
      .finally(() => {
        setBusy(null);
        setLoading(null);
      });
  };

  const doInstall = () => {
    if (!spec.trim()) return;
    act('install', { spec: spec.trim() }, 'install', t('installing'));
  };

  const doSearch = () => {
    setSearching(true);
    pmgr.search({ q: searchQuery })
      .then((data) => setSearchResults(data))
      .catch((e) => setSearchResults({ ok: false, message: String((e && e.message) || e), items: [] }))
      .finally(() => setSearching(false));
  };

  const installFromSearch = (r) => {
    act('install', { spec: 'github:' + r.fullName + '#' + r.defaultBranch }, 'install', t('installing'));
  };

  const autoRestart = !!(d && d.settings && d.settings.autoRestart);
  const toggleAutoRestart = () => {
    setBusy('settings');
    pmgr.setSettings({ autoRestart: !autoRestart })
      .then((res) => {
        if (res && res.ok && res.settings) {
          setState((prev) => ({ ...prev, data: { ...prev.data, settings: res.settings } }));
        }
      })
      .catch(() => {})
      .finally(() => setBusy(null));
  };

  const doRestartNow = () => {
    setModal(null);
    setBusy('restart');
    pmgr.restart()
      .then((res) => {
        if (res && res.ok) {
          setModal({ kind: 'ok', title: t('opRestart'), text: res.message || t('restarting'), output: null });
        } else {
          setModal({ kind: 'err', title: t('opRestart') + ' ' + t('failed'), text: (res && res.message) || t('restartFailed'), output: null });
        }
      })
      .catch((e) => setModal({ kind: 'err', title: t('opRestart') + ' ' + t('failed'), text: String((e && e.message) || e), output: null }))
      .finally(() => setBusy(null));
  };

  const renderRow = (p) => {
    const stateBadge = p.missing
      ? React.createElement(Badge, { kind: 'missing' }, t('missingStat'))
      : p.enabled
        ? React.createElement(Badge, { kind: 'enabled' }, t('enabledStat'))
        : React.createElement(Badge, { kind: 'stopped' }, t('stoppedStat'));
    const runtimeDot = p.mounted && p.enabled && p.runtime
      ? React.createElement(RuntimeDot, { t, phase: p.runtime.fiberPhase })
      : null;
    const kindBadge = p.kind === 'builtin'
      ? React.createElement(Badge, null, t('kindBuiltin'))
      : React.createElement(Badge, { kind: 'kind-third' }, t('kindThird'));
    const srcBadge = p.source === 'github'
      ? React.createElement(Badge, null, t('sourceGithub'))
      : p.source === 'npm'
        ? React.createElement(Badge, null, t('sourceNpm'))
        : null;

    const actions = [];
    if (p.kind === 'third-party') {
      if (p.mounted) {
        actions.push(
          React.createElement(
            'button',
            {
              key: 'toggle',
              className: 'pmgr-btn pmgr-btn-sm',
              disabled: busy !== null,
              onClick: () => {
                if (p.disabled) {
                  act('start', { name: p.name }, p.name);
                } else {
                  setConfirm({ title: t('opStop'), message: t('confirmStop', { name: p.name }), onConfirm: () => act('stop', { name: p.name }, p.name) });
                }
              },
            },
            p.disabled ? t('actionStart') : t('actionStop')
          )
        );
      } else if (p.isBundle && p.installed) {
        actions.push(
          React.createElement(
            'button',
            {
              key: 'toggle',
              className: 'pmgr-btn pmgr-btn-sm',
              disabled: busy !== null,
              onClick: () => act('start', { name: p.name }, p.name),
            },
            t('actionLoad')
          )
        );
      }
      actions.push(
        React.createElement(
          'button',
          {
            key: 'uninstall',
            className: 'pmgr-btn pmgr-btn-sm weak',
            disabled: busy !== null,
            onClick: () => {
              setConfirm({
                title: t('opUninstall'),
                message: t('confirmUninstall', { name: p.name }),
                onConfirm: () => act('uninstall', { name: p.name }, p.name, t('uninstalling')),
              });
            },
          },
          t('actionUninstall')
        )
      );
    }
    const busyThis = busy === p.name || busy === 'install';
    return React.createElement(
      'div',
      { key: p.name, className: 'pmgr-card' },
      React.createElement(
        'div',
        { className: 'pmgr-card-header' },
        React.createElement(
          'div',
          { className: 'pmgr-card-info' },
          React.createElement(
            'div',
            { className: 'pmgr-card-title-row' },
            React.createElement('span', { className: 'pmgr-name', title: p.name }, p.name),
            p.version ? React.createElement('span', { className: 'pmgr-ver' }, p.version) : null
          ),
          React.createElement(
            'div',
            { className: 'pmgr-card-badges' },
            kindBadge,
            srcBadge,
            stateBadge,
            runtimeDot
          )
        ),
        React.createElement('div', { className: 'pmgr-card-actions' }, ...actions)
      ),
      p.description
        ? React.createElement('p', { className: 'pmgr-card-desc', title: p.description }, p.description)
        : null,
      React.createElement(CardMeta, { t, p }),
      busyThis ? React.createElement('p', { className: 'pmgr-foot' }, t('processing')) : null
    );
  };

  return React.createElement(
    'div',
    { className: 'pmgr-root' },
    React.createElement(
      'div',
      { className: 'pmgr-head' },
      React.createElement(
        'div',
        { className: 'pmgr-title-row' },
        React.createElement('h2', { className: 'pmgr-title' }, t('title')),
        d && d.profile
          ? React.createElement(Badge, null, 'profile: ' + d.profile + ' · ' + d.profileDir)
          : null,
        React.createElement(
          'button',
          { className: 'pmgr-btn', disabled: state.loading, onClick: () => refresh(false) },
          t('refresh')
        )
      ),
      React.createElement(
        'div',
        { className: 'pmgr-status-row' },
        d && d.counts
          ? React.createElement(Badge, null, t('builtinLabel') + ' ' + d.counts.builtin + ' / ' + t('thirdLabel') + ' ' + d.counts.thirdParty)
          : null,
        d
          ? React.createElement(
              Badge,
              null,
              t('enabledStat') + ' ' + plugins.filter((q) => q.enabled).length +
              ' · ' + t('stoppedStat') + ' ' + plugins.filter((q) => !q.enabled && !q.missing).length +
              ' · ' + t('missingStat') + ' ' + plugins.filter((q) => q.missing).length
            )
          : null
      )
    ),
    React.createElement('h3', { className: 'pmgr-section-title' }, t('installTitle')),
    React.createElement(
      'div',
      { className: 'pmgr-install' },
      React.createElement('input', {
        className: 'pmgr-input',
        placeholder: t('installPlaceholder'),
        value: spec,
        onChange: (e) => setSpec(e.target.value),
        onKeyDown: (e) => {
          if (e.key === 'Enter') doInstall();
        },
      }),
      React.createElement(
        'button',
        { className: 'pmgr-btn', disabled: busy !== null || !spec.trim(), onClick: doInstall },
        busy === 'install' ? t('installing') : t('install')
      ),
      React.createElement(
        'label',
        { className: 'pmgr-toggle' },
        React.createElement('span', { className: 'pmgr-toggle-label' }, t('autoRestart')),
        React.createElement(
          'button',
          {
            type: 'button',
            role: 'switch',
            'aria-checked': autoRestart,
            className: 'pmgr-switch' + (autoRestart ? ' on' : ''),
            disabled: busy !== null,
            onClick: toggleAutoRestart,
          },
          React.createElement('span', { className: 'pmgr-switch-knob' })
        )
      )
    ),
    React.createElement('h3', { className: 'pmgr-section-title' }, t('searchTitle')),
    React.createElement(
      'div',
      { className: 'pmgr-install' },
      React.createElement('input', {
        className: 'pmgr-input',
        placeholder: t('searchPlaceholder'),
        value: searchQuery,
        onChange: (e) => setSearchQuery(e.target.value),
        onKeyDown: (e) => {
          if (e.key === 'Enter') doSearch();
        },
      }),
      React.createElement(
        'button',
        { className: 'pmgr-btn', disabled: searching, onClick: doSearch },
        searching ? t('searching') : t('searchBtn')
      )
    ),
    searchResults && searchResults.ok && Array.isArray(searchResults.items) && searchResults.items.length > 0
      ? React.createElement(
          'div',
          { className: 'pmgr-search-results' },
          searchResults.items.map((r) =>
            React.createElement(
              'div',
              { key: r.fullName, className: 'pmgr-search-item' },
              React.createElement(
                'div',
                { className: 'pmgr-search-item-info' },
                React.createElement('a', { className: 'pmgr-search-item-name', href: r.htmlUrl, target: '_blank', rel: 'noreferrer', title: r.fullName }, r.fullName),
                React.createElement('span', { className: 'pmgr-search-item-stars' }, '⭐ ' + r.stars),
                r.description
                  ? React.createElement('p', { className: 'pmgr-search-item-desc' }, r.description)
                  : null
              ),
              React.createElement(
                'button',
                { className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: () => installFromSearch(r) },
                t('install')
              )
            )
          )
        )
      : null,
    searchResults && searchResults.ok && searchResults.items && searchResults.items.length === 0
      ? React.createElement('div', { className: 'pmgr-empty' }, t('noResults'))
      : null,
    searchResults && !searchResults.ok
      ? React.createElement('div', { className: 'pmgr-notice err' }, searchResults.message || t('opFailed'))
      : null,
    state.error
      ? React.createElement('div', { className: 'pmgr-notice err' }, String(state.error))
      : null,
    state.loading && !state.data
      ? React.createElement('div', { className: 'pmgr-empty' }, t('loading'))
      : null,
    React.createElement(PluginGroup, {
      t,
      title: t('groupThird'),
      count: third.length,
      open: thirdOpen,
      onToggle: () => setThirdOpen(!thirdOpen),
      query: thirdQuery,
      onQuery: setThirdQuery,
      plugins: third,
      renderRow,
    }),
    React.createElement(PluginGroup, {
      t,
      title: t('groupBuiltin'),
      count: builtin.length,
      open: builtinOpen,
      onToggle: () => setBuiltinOpen(!builtinOpen),
      query: builtinQuery,
      onQuery: setBuiltinQuery,
      plugins: builtin,
      renderRow,
    }),
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
    confirm
      ? React.createElement(
          'div',
          { className: 'pmgr-modal-backdrop', onClick: () => setConfirm(null) },
          React.createElement(
            'div',
            { className: 'pmgr-modal', onClick: (e) => e.stopPropagation() },
            React.createElement(
              'div',
              { className: 'pmgr-modal-head' },
              React.createElement('h3', { className: 'pmgr-modal-title' }, confirm.title),
              React.createElement('button', { className: 'pmgr-modal-close', onClick: () => setConfirm(null), 'aria-label': '×' }, '×')
            ),
            React.createElement('div', { className: 'pmgr-modal-body' },
              React.createElement('p', { className: 'pmgr-modal-text' }, confirm.message)
            ),
            React.createElement(
              'div',
              { className: 'pmgr-modal-actions' },
              React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm', onClick: () => setConfirm(null) }, t('cancel')),
              React.createElement(
                'button',
                {
                  className: 'pmgr-btn pmgr-btn-sm danger',
                  onClick: () => {
                    setConfirm(null);
                    confirm.onConfirm();
                  },
                },
                t('ok')
              )
            )
          )
        )
      : null,
    modal
      ? React.createElement(
          'div',
          { className: 'pmgr-modal-backdrop', onClick: () => setModal(null) },
          React.createElement(
            'div',
            { className: 'pmgr-modal' + (modal.kind === 'err' ? ' err' : ''), onClick: (e) => e.stopPropagation() },
            React.createElement(
              'div',
              { className: 'pmgr-modal-head' },
              React.createElement('h3', { className: 'pmgr-modal-title' }, modal.title),
              React.createElement('button', { className: 'pmgr-modal-close', onClick: () => setModal(null), 'aria-label': '×' }, '×')
            ),
            React.createElement('div', { className: 'pmgr-modal-body' },
              React.createElement('p', { className: 'pmgr-modal-text' }, modal.text),
              modal.output ? React.createElement('pre', { className: 'pmgr-output' }, modal.output) : null
            ),
            React.createElement(
              'div',
              { className: 'pmgr-modal-actions' },
              modal.pendingRestart
                ? React.createElement('button', { className: 'pmgr-btn', onClick: doRestartNow, disabled: busy !== null }, t('restartNow'))
                : null,
              React.createElement('button', { className: 'pmgr-btn pmgr-btn-sm', onClick: () => setModal(null) }, t('ok'))
            )
          )
        )
      : null,
    React.createElement('p', { className: 'pmgr-foot' }, t('footNote'))
  );
}

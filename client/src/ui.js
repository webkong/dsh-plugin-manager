// UI 组件：插件管理器标签页（React.createElement，无 JSX）
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

// 依赖声明中的 ref（# 之后的 branch/commit）
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

// githubUrl → owner/repo
function repoFromUrl(url) {
  const m = String(url || '').match(/github\.com\/([^/]+\/[^/?#]+)/);
  return m ? m[1] : '';
}

export function Badge(props) {
  return React.createElement('span', { className: 'pmgr-badge ' + (props.kind || '') }, props.children);
}

// Runtime 状态：绿色小圆点 + 弱文字
function RuntimeDot(props) {
  const { phase } = props;
  const active = phase === 'active';
  return React.createElement(
    'span',
    { className: 'pmgr-runtime' },
    React.createElement('span', { className: 'pmgr-dot' + (active ? '' : ' off') }),
    active ? '运行中' : phase ? String(phase) : '未运行'
  );
}

// 来源 metadata footer：GitHub · owner/repo · ref / npm / 本地；末尾追加 GitHub ↗ 跳转（小号）
function CardMeta(props) {
  const { p } = props;
  const ghLink = p.githubUrl
    ? React.createElement(
        'a',
        {
          key: 'gh',
          className: 'pmgr-meta-gh',
          href: p.githubUrl,
          target: '_blank',
          rel: 'noreferrer',
          title: p.githubUrl,
        },
        'GitHub ↗'
      )
    : null;
  const meta = [];
  if (p.source === 'github' && p.githubUrl) {
    const repo = repoFromUrl(p.githubUrl);
    const ref = refFromSpec(p.spec);
    const short = shortRef(ref);
    meta.push(
      React.createElement('span', { key: 'label', className: 'pmgr-meta-label' }, '来源'),
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
          { key: 'ref', className: 'pmgr-meta-hash', title: isCommitHash(ref) ? '完整 commit: ' + ref : '' },
          '· ' + short
        )
      );
    }
  } else if (p.source === 'npm') {
    meta.push(
      React.createElement('span', { key: 'label', className: 'pmgr-meta-label' }, '来源'),
      React.createElement('span', { key: 'sep1', className: 'pmgr-meta-sep' }, '·'),
      React.createElement('span', { key: 'body', className: 'pmgr-meta-hash' }, 'npm' + (p.name ? ' · ' + p.name : ''))
    );
  } else if (p.source === 'local') {
    meta.push(
      React.createElement('span', { key: 'label', className: 'pmgr-meta-label' }, '来源'),
      React.createElement('span', { key: 'sep1', className: 'pmgr-meta-sep' }, '·'),
      React.createElement('span', { key: 'body' }, '本地路径')
    );
  }
  if (ghLink) meta.push(ghLink);
  return meta.length ? React.createElement('div', { className: 'pmgr-card-meta' }, ...meta) : null;
}

// 一个可折叠分组：标题 + 搜索框 + 过滤后的插件列表
function PluginGroup(props) {
  const { title, count, open, onToggle, query, onQuery, plugins, renderRow } = props;
  const filtered = plugins.filter((p) => fuzzyMatch(p.name + ' ' + (p.description || ''), query));
  return React.createElement(
    'div',
    { className: 'pmgr-group' },
    React.createElement(
      'div',
      { className: 'pmgr-group-head', onClick: onToggle },
      React.createElement('h3', { className: 'pmgr-group-title' }, title + '（' + count + '）'),
      React.createElement('span', { className: 'pmgr-group-toggle' }, open ? '▾ 收起' : '▸ 展开')
    ),
    open
      ? React.createElement(
          'div',
          { className: 'pmgr-group' },
          React.createElement('input', {
            className: 'pmgr-input pmgr-search',
            placeholder: '搜索' + title + '…（模糊匹配）',
            value: query,
            onChange: (e) => onQuery(e.target.value),
          }),
          filtered.length
            ? filtered.map(renderRow)
            : React.createElement('div', { className: 'pmgr-empty' }, '无匹配')
        )
      : null
  );
}

export function PluginManagerTab() {
  const [state, setState] = React.useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = React.useState(null);
  const [spec, setSpec] = React.useState('');
  const [notice, setNotice] = React.useState(null);
  const [thirdOpen, setThirdOpen] = React.useState(true);
  const [builtinOpen, setBuiltinOpen] = React.useState(false);
  const [thirdQuery, setThirdQuery] = React.useState('');
  const [builtinQuery, setBuiltinQuery] = React.useState('');

  const refresh = (silent) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    pmgr.list()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((e) => setState({ loading: false, error: String((e && e.message) || e), data: null }));
  };

  React.useEffect(() => {
    refresh(true);
  }, []);

  const act = (method, args, label) => {
    setBusy(label);
    setNotice(null);
    pmgr[method](args)
      .then((data) => {
        setNotice({
          kind: data && data.ok ? 'ok' : 'err',
          text: (data && data.message) || (data && data.ok ? '完成' : '失败'),
        });
        if (data && data.output) setNotice((n) => ({ ...n, output: data.output }));
        refresh(true);
      })
      .catch((e) => setNotice({ kind: 'err', text: String((e && e.message) || e) }))
      .finally(() => setBusy(null));
  };

  const doInstall = () => {
    if (!spec.trim()) return;
    act('install', { spec: spec.trim() }, 'install');
  };

  const d = state.data;
  const plugins = d && d.plugins ? d.plugins : [];
  const builtin = plugins.filter((p) => p.kind === 'builtin');
  const third = plugins.filter((p) => p.kind === 'third-party');

  const renderRow = (p) => {
    // 状态：已启用（浅绿 Badge）/ 已停用（灰）/ 失效（红）
    const stateBadge = p.missing
      ? React.createElement(Badge, { kind: 'missing' }, '失效')
      : p.enabled
        ? React.createElement(Badge, { kind: 'enabled' }, '已启用')
        : React.createElement(Badge, { kind: 'stopped' }, '已停用');
    // Runtime 圆点：仅挂载时显示
    const runtimeDot = p.mounted && p.enabled && p.runtime
      ? React.createElement(RuntimeDot, { phase: p.runtime.fiberPhase })
      : null;
    const kindBadge = p.kind === 'builtin'
      ? React.createElement(Badge, null, '内置')
      : React.createElement(Badge, { kind: 'kind-third' }, '第三方');
    const srcBadge = p.source === 'github'
      ? React.createElement(Badge, null, 'GitHub')
      : p.source === 'npm'
        ? React.createElement(Badge, null, 'npm')
        : null;

    const actions = [];
    if (p.kind === 'third-party') {
      if (p.mounted) {
        actions.push(
          React.createElement(
            'button',
            {
              key: 'toggle',
              className: 'pmgr-btn',
              disabled: busy !== null,
              onClick: () => act(p.disabled ? 'start' : 'stop', { name: p.name }, p.name),
            },
            p.disabled ? '启动' : '停用'
          )
        );
      } else if (p.isBundle && p.installed) {
        actions.push(
          React.createElement(
            'button',
            {
              key: 'toggle',
              className: 'pmgr-btn',
              disabled: busy !== null,
              onClick: () => act('start', { name: p.name }, p.name),
            },
            '装载'
          )
        );
      }
      actions.push(
        React.createElement(
          'button',
          {
            key: 'uninstall',
            className: 'pmgr-btn weak',
            disabled: busy !== null,
            onClick: () => {
              if (window.confirm('确定卸载插件 ' + p.name + ' 吗？（重启后不再装载）')) {
                act('uninstall', { name: p.name }, p.name);
              }
            },
          },
          '卸载'
        )
      );
    }
    const busyThis = busy === p.name || busy === 'install';
    return React.createElement(
      'div',
      { key: p.name, className: 'pmgr-card' },
      // 第一层：Header
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
      // 第二层：描述（无描述不渲染，避免空白占位）
      p.description
        ? React.createElement('p', { className: 'pmgr-card-desc', title: p.description }, p.description)
        : null,
      // 第三层：来源 metadata
      React.createElement(CardMeta, { p }),
      busyThis ? React.createElement('p', { className: 'pmgr-foot' }, '处理中…') : null
    );
  };

  return React.createElement(
    'div',
    { className: 'pmgr-root' },
    React.createElement(
      'div',
      { className: 'pmgr-head' },
      React.createElement('h2', { className: 'pmgr-title' }, 'DSH 插件管理器'),
      d && d.profile
        ? React.createElement(Badge, null, 'profile: ' + d.profile + ' · ' + d.profileDir)
        : null,
      d && d.counts
        ? React.createElement(Badge, null, '内置 ' + d.counts.builtin + ' / 三方 ' + d.counts.thirdParty)
        : null,
      d
        ? React.createElement(
            Badge,
            null,
            '已启用 ' + plugins.filter((q) => q.enabled).length +
            ' · 已停用 ' + plugins.filter((q) => !q.enabled && !q.missing).length +
            ' · 失效 ' + plugins.filter((q) => q.missing).length
          )
        : null,
      React.createElement(
        'button',
        { className: 'pmgr-btn', disabled: state.loading, onClick: () => refresh(false) },
        '刷新'
      )
    ),
    React.createElement(
      'div',
      { className: 'pmgr-install' },
      React.createElement('input', {
        className: 'pmgr-input',
        placeholder: '安装：插件名 / github:owner/repo#main / 任意 pnpm 包标识',
        value: spec,
        onChange: (e) => setSpec(e.target.value),
        onKeyDown: (e) => {
          if (e.key === 'Enter') doInstall();
        },
      }),
      React.createElement(
        'button',
        { className: 'pmgr-btn', disabled: busy !== null || !spec.trim(), onClick: doInstall },
        busy === 'install' ? '安装中…' : '安装'
      )
    ),
    notice
      ? React.createElement(
          'div',
          { className: 'pmgr-notice ' + notice.kind },
          notice.text,
          notice.output ? React.createElement('pre', { className: 'pmgr-output' }, notice.output) : null
        )
      : null,
    state.error
      ? React.createElement('div', { className: 'pmgr-notice err' }, String(state.error))
      : null,
    state.loading && !state.data
      ? React.createElement('div', { className: 'pmgr-empty' }, '加载中…')
      : null,
    // 三方插件（上移，默认展开）
    React.createElement(PluginGroup, {
      title: '三方插件',
      count: third.length,
      open: thirdOpen,
      onToggle: () => setThirdOpen(!thirdOpen),
      query: thirdQuery,
      onQuery: setThirdQuery,
      plugins: third,
      renderRow,
    }),
    // 内置插件（默认收起）
    React.createElement(PluginGroup, {
      title: '内置插件',
      count: builtin.length,
      open: builtinOpen,
      onToggle: () => setBuiltinOpen(!builtinOpen),
      query: builtinQuery,
      onQuery: setBuiltinQuery,
      plugins: builtin,
      renderRow,
    }),
    React.createElement(
      'p',
      { className: 'pmgr-foot' },
      '说明：安装 / 卸载通过 pnpm（dsh plugin）执行，重启后生效；停用 / 启动通过修改 profile 的 cordis.patch.yml（重启后生效，若当前进程 HMR 已激活则可能即时生效）。内置插件属于 DSH 发行版，只读。' +
      ' 三方插件的 GitHub 链接取自依赖声明或已安装包的 repository 字段。'
    )
  );
}

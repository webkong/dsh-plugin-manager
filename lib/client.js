window.__ModuleLoader__.load({
  id: 'dsh-plugin-manager',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    let React = require('react');

    //#region styles
    const CSS = `
.pmgr-root { display: flex; flex-direction: column; gap: 14px; padding: 4px 2px 24px; }
.pmgr-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pmgr-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
.pmgr-badge { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; padding: 2px 10px; font-size: 12px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); }
.pmgr-badge.kind-builtin { color: var(--dsw-alias-label-secondary); }
.pmgr-badge.kind-third { color: var(--dsw-alias-brand-primary); }
.pmgr-badge.state-on { color: var(--dsw-alias-state-success-primary); }
.pmgr-badge.state-off { color: var(--dsw-alias-state-warn-primary); }
.pmgr-badge.state-missing { color: var(--dsw-alias-state-error-primary); }
.pmgr-install { display: flex; gap: 8px; align-items: center; }
.pmgr-input { flex: 1; min-width: 0; height: 34px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 0 12px; font-size: 13px; }
.pmgr-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.pmgr-btn { height: 34px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 0 14px; font-size: 13px; cursor: pointer; }
.pmgr-btn:hover:not(:disabled) { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.pmgr-btn:disabled { opacity: 0.55; cursor: default; }
.pmgr-btn.primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: #fff; }
.pmgr-btn.danger:hover:not(:disabled) { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.pmgr-btn.link { border: none; background: none; padding: 0 6px; color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.pmgr-group { display: flex; flex-direction: column; gap: 8px; }
.pmgr-group-title { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; }
.pmgr-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.pmgr-card-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pmgr-name { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary); min-width: 0; }
.pmgr-ver { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
.pmgr-desc { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 0; line-height: 1.5; }
.pmgr-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.pmgr-notice { font-size: 12px; border-radius: 8px; padding: 8px 10px; line-height: 1.5; }
.pmgr-notice.ok { color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.pmgr-notice.err { color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.pmgr-output { font-size: 11px; font-family: ui-monospace, monospace; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 6px; padding: 8px; max-height: 180px; overflow: auto; margin: 0; }
.pmgr-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); padding: 12px 0; }
.pmgr-foot { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); line-height: 1.6; margin: 0; }
`;
    const STYLE_ID = 'dsh-plugin-manager/pmgr.css';
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-plugin-manager';
      tag.dataset.pluginCss = STYLE_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
    //#endregion

    //#region minimal zod-compatible codecs（仅用于 Remote $mount 的 strict codec 校验）
    function makeSchema(base) {
      base.optional = () => {
        const s = makeSchema({ ...base });
        s._optional = true;
        return s;
      };
      base.nullable = () => makeSchema({
        ...base,
        parse: (v) => (v === null ? null : base.parse(v)),
      });
      base.readonly = () => base;
      base.passthrough = () => base;
      base.safeParse = (v) => {
        try {
          return { success: true, data: base.parse(v) };
        } catch (e) {
          return { success: false, error: e };
        }
      };
      return base;
    }
    function zStr() {
      return makeSchema({
        kind: 'string',
        parse: (v) => {
          if (typeof v !== 'string') throw new Error('expected string, got ' + typeof v);
          return v;
        },
      });
    }
    function zAny() {
      return makeSchema({
        kind: 'any',
        parse: (v) => v,
      });
    }
    function zObj(fields) {
      return makeSchema({
        kind: 'object',
        parse: (v) => {
          if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new Error('expected object');
          const out = {};
          for (const key of Object.keys(fields)) {
            const field = fields[key];
            if (field._optional) {
              if (key in v) out[key] = field.parse(v[key]);
            } else {
              if (!(key in v)) throw new Error('missing field ' + key);
              out[key] = field.parse(v[key]);
            }
          }
          for (const key of Object.keys(v)) if (!(key in fields)) out[key] = v[key];
          return out;
        },
      });
    }
    //#endregion

    //#region Remote 清单（wire 与 Host 方法参数名一致）
    const PMGR_INVOCATIONS = [
      {
        id: 'dsh-plugin-manager#pmgr/list',
        service: 'pmgr',
        namespace: 'pmgr',
        method: 'list',
        invocation: { kind: 'direct' },
        parameters: [],
        result: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Snapshot', schema: zAny() },
      },
      {
        id: 'dsh-plugin-manager#pmgr/installPlugin',
        service: 'pmgr',
        namespace: 'pmgr',
        method: 'installPlugin',
        invocation: { kind: 'direct' },
        parameters: [
          { name: 'spec', wire: 'spec', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Spec', schema: zObj({ spec: zStr() }) } },
        ],
        result: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Result', schema: zAny() },
      },
      {
        id: 'dsh-plugin-manager#pmgr/uninstall',
        service: 'pmgr',
        namespace: 'pmgr',
        method: 'uninstall',
        invocation: { kind: 'direct' },
        parameters: [
          { name: 'name', wire: 'name', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Name', schema: zObj({ name: zStr() }) } },
        ],
        result: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Result', schema: zAny() },
      },
      {
        id: 'dsh-plugin-manager#pmgr/stop',
        service: 'pmgr',
        namespace: 'pmgr',
        method: 'stop',
        invocation: { kind: 'direct' },
        parameters: [
          { name: 'name', wire: 'name', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Name', schema: zObj({ name: zStr() }) } },
        ],
        result: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Result', schema: zAny() },
      },
      {
        id: 'dsh-plugin-manager#pmgr/start',
        service: 'pmgr',
        namespace: 'pmgr',
        method: 'start',
        invocation: { kind: 'direct' },
        parameters: [
          { name: 'name', wire: 'name', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Name', schema: zObj({ name: zStr() }) } },
        ],
        result: { mode: 'strict', typeSymbol: 'dsh-plugin-manager#Result', schema: zAny() },
      },
    ];
    const PMGR_REMOTE = { package: 'dsh-plugin-manager', descriptors: PMGR_INVOCATIONS };
    //#endregion

    //#region UI
    function Badge(props) {
      return React.createElement('span', { className: 'pmgr-badge ' + (props.kind || '') }, props.children);
    }

    function PluginManagerTab(props) {
      const holder = props.holder;
      const [pmgr, setPmgr] = React.useState(holder.pmgr);
      const [state, setState] = React.useState({ loading: true, error: null, data: null });
      const [busy, setBusy] = React.useState(null);
      const [spec, setSpec] = React.useState('');
      const [notice, setNotice] = React.useState(null);

      React.useEffect(() => {
        if (holder.pmgr) setPmgr(holder.pmgr);
        holder.onReady = (p) => setPmgr(p);
        return () => {
          holder.onReady = null;
        };
      }, []);

      const refresh = (silent) => {
        if (pmgr === null) return;
        if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
        pmgr.list()
          .then((res) => {
            if (!res.ok) throw new Error((res.error && (res.error.message || res.error.code)) || 'list failed');
            setState({ loading: false, error: null, data: res.value });
          })
          .catch((e) => setState({ loading: false, error: String((e && e.message) || e), data: null }));
      };

      React.useEffect(() => {
        if (pmgr === null) return;
        refresh(true);
      }, [pmgr]);

      const act = (method, args, label) => {
        setBusy(label);
        setNotice(null);
        pmgr[method](args)
          .then((res) => {
            if (!res.ok) throw new Error((res.error && (res.error.message || res.error.code)) || '操作失败');
            setNotice({ kind: 'ok', text: res.value && res.value.message ? res.value.message : '完成' });
            if (res.value && res.value.output) setNotice((n) => ({ ...n, output: res.value.output }));
            refresh(true);
          })
          .catch((e) => setNotice({ kind: 'err', text: String((e && e.message) || e) }))
          .finally(() => setBusy(null));
      };

      const doInstall = () => {
        if (!spec.trim()) return;
        act('installPlugin', { spec: spec.trim() }, 'install');
      };

      if (pmgr === null) {
        return React.createElement(
          'div',
          { className: 'pmgr-root' },
          React.createElement('h2', { className: 'pmgr-title' }, 'DSH 插件管理器'),
          React.createElement('div', { className: 'pmgr-empty' }, '正在连接 Host（Remote pmgr 挂载中）…')
        );
      }

      const d = state.data;
      const plugins = d && d.plugins ? d.plugins : [];
      const builtin = plugins.filter((p) => p.kind === 'builtin');
      const third = plugins.filter((p) => p.kind === 'third-party');

      const renderRow = (p) => {
        const stateBadge = p.missing
          ? React.createElement(Badge, { kind: 'state-missing' }, '失效')
          : p.disabled
            ? React.createElement(Badge, { kind: 'state-off' }, '已停用')
            : p.inBundles
              ? React.createElement(Badge, { kind: 'state-on' }, '已装载')
              : React.createElement(Badge, { kind: 'state-off' }, '未装载');
        const kindBadge = p.kind === 'builtin'
          ? React.createElement(Badge, { kind: 'kind-builtin' }, '内置')
          : React.createElement(Badge, { kind: 'kind-third' }, '三方');
        const srcBadge = p.source === 'github'
          ? React.createElement(Badge, null, 'GitHub')
          : p.source === 'npm'
            ? React.createElement(Badge, null, 'npm')
            : null;
        const phase = p.runtime && p.runtime.fiberPhase
          ? React.createElement(Badge, null, '运行: ' + p.runtime.fiberPhase)
          : null;

        const actions = [];
        if (p.kind === 'third-party') {
          if (p.inBundles) {
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
                className: 'pmgr-btn danger',
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
        if (p.githubUrl) {
          actions.push(
            React.createElement(
              'a',
              {
                key: 'gh',
                className: 'pmgr-btn link',
                href: p.githubUrl,
                target: '_blank',
                rel: 'noreferrer',
                title: p.githubUrl,
              },
              'GitHub ↗'
            )
          );
        }

        const busyThis = busy === p.name || busy === 'install';
        return React.createElement(
          'div',
          { key: p.name, className: 'pmgr-card' },
          React.createElement(
            'div',
            { className: 'pmgr-card-row' },
            React.createElement('span', { className: 'pmgr-name' }, p.name),
            p.version ? React.createElement('span', { className: 'pmgr-ver' }, p.version) : null,
            kindBadge,
            stateBadge,
            srcBadge,
            phase,
            actions.length
              ? React.createElement('div', { className: 'pmgr-actions' }, ...actions)
              : null
          ),
          p.description ? React.createElement('p', { className: 'pmgr-desc' }, p.description) : null,
          p.spec && p.spec !== p.name ? React.createElement('p', { className: 'pmgr-desc' }, '来源: ' + p.spec) : null,
          busyThis ? React.createElement('p', { className: 'pmgr-desc' }, '处理中…') : null
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
            ? React.createElement(Badge, null, '内置 ' + d.counts.builtin + ' / 三方 ' + d.counts.thirdParty + ' / 已停用 ' + d.counts.disabled)
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
            { className: 'pmgr-btn primary', disabled: busy !== null || !spec.trim(), onClick: doInstall },
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
        React.createElement(
          'div',
          { className: 'pmgr-group' },
          React.createElement('h3', { className: 'pmgr-group-title' }, '内置插件（DSH 发行版自带，只读）'),
          builtin.length
            ? builtin.map(renderRow)
            : React.createElement('div', { className: 'pmgr-empty' }, '无')
        ),
        React.createElement(
          'div',
          { className: 'pmgr-group' },
          React.createElement('h3', { className: 'pmgr-group-title' }, '三方插件（可安装 / 卸载 / 启动 / 停用）'),
          third.length
            ? third.map(renderRow)
            : React.createElement('div', { className: 'pmgr-empty' }, '无')
        ),
        React.createElement(
          'p',
          { className: 'pmgr-foot' },
          '说明：安装 / 卸载通过 pnpm（dsh plugin）执行，重启后生效；停用 / 启动通过修改 profile 的 cordis.patch.yml（重启后生效，若当前进程 HMR 已激活则可能即时生效）。内置插件属于 DSH 发行版，不可修改。' +
          ' 三方插件的 GitHub 链接取自依赖声明或已安装包的 repository 字段。'
        )
      );
    }
    //#endregion

    //#region 插件入口
    const inject = ['remote', 'slots'];

    function apply(ctx) {
      const holder = { pmgr: null, onReady: null };
      ctx.effect(async () => {
        const dispose = await ctx.remote.$mount(PMGR_REMOTE);
        holder.pmgr = ctx.reflect.get('remote.pmgr');
        if (holder.pmgr === undefined) {
          throw new Error('dsh-plugin-manager: Remote 命名空间 pmgr 未挂载');
        }
        if (typeof holder.onReady === 'function') holder.onReady(holder.pmgr);
        return () => {
          holder.pmgr = null;
          void dispose();
        };
      }, 'dsh-plugin-manager: remote');

      const slots = ctx.get('slots');
      if (slots === undefined) return;
      slots.inject('settings.plugins.tab', () =>
        slots.register(
          {
            name: 'settings.plugins.tab',
            id: 'pm-manage',
            order: 20,
            label: () => '管理',
          },
          () => React.createElement(PluginManagerTab, { holder })
        )
      );
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
    //#endregion
  },
});

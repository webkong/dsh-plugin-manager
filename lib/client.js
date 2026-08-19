window.__ModuleLoader__.load({
  id: 'dsh-plugin-manager',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/src/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react2 = __toESM(require("react"), 1);

// client/src/styles.js
var CSS = `
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
.pmgr-group-head { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; user-select: none; }
.pmgr-group-head:hover .pmgr-group-title { color: var(--dsw-alias-label-primary); }
.pmgr-group-toggle { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
.pmgr-search { height: 30px; font-size: 12px; }
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
var STYLE_ID = "dsh-plugin-manager/pmgr.css";
function injectStyles() {
  if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-plugin-manager";
    tag.dataset.pluginCss = STYLE_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }
}

// client/src/ui.js
var import_react = __toESM(require("react"), 1);

// client/src/api.js
async function call(path, body) {
  const response = await fetch(path, body === void 0 ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  let data = null;
  try {
    data = await response.json();
  } catch {
  }
  if (!response.ok) {
    throw new Error(data !== null && typeof data.error === "string" ? data.error : "HTTP " + response.status);
  }
  return data;
}
var pmgr = {
  list: () => call("/pmgr/list"),
  install: (spec) => call("/pmgr/install", { spec }),
  uninstall: (name) => call("/pmgr/uninstall", { name }),
  stop: (name) => call("/pmgr/stop", { name }),
  start: (name) => call("/pmgr/start", { name })
};

// client/src/ui.js
function fuzzyMatch(text, query) {
  const t = String(text || "").toLowerCase();
  const q = String(query || "").toLowerCase();
  if (!q) return true;
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return false;
    ti = found + 1;
  }
  return true;
}
function Badge(props) {
  return import_react.default.createElement("span", { className: "pmgr-badge " + (props.kind || "") }, props.children);
}
function PluginGroup(props) {
  const { title, count, open, onToggle, query, onQuery, plugins, renderRow } = props;
  const filtered = plugins.filter((p) => fuzzyMatch(p.name + " " + (p.description || ""), query));
  return import_react.default.createElement(
    "div",
    { className: "pmgr-group" },
    import_react.default.createElement(
      "div",
      { className: "pmgr-group-head", onClick: onToggle },
      import_react.default.createElement("h3", { className: "pmgr-group-title" }, title + "\uFF08" + count + "\uFF09"),
      import_react.default.createElement("span", { className: "pmgr-group-toggle" }, open ? "\u25BE \u6536\u8D77" : "\u25B8 \u5C55\u5F00")
    ),
    open ? import_react.default.createElement(
      "div",
      { className: "pmgr-group" },
      import_react.default.createElement("input", {
        className: "pmgr-input pmgr-search",
        placeholder: "\u641C\u7D22" + title + "\u2026\uFF08\u6A21\u7CCA\u5339\u914D\uFF09",
        value: query,
        onChange: (e) => onQuery(e.target.value)
      }),
      filtered.length ? filtered.map(renderRow) : import_react.default.createElement("div", { className: "pmgr-empty" }, "\u65E0\u5339\u914D")
    ) : null
  );
}
function PluginManagerTab() {
  const [state, setState] = import_react.default.useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = import_react.default.useState(null);
  const [spec, setSpec] = import_react.default.useState("");
  const [notice, setNotice] = import_react.default.useState(null);
  const [thirdOpen, setThirdOpen] = import_react.default.useState(true);
  const [builtinOpen, setBuiltinOpen] = import_react.default.useState(false);
  const [thirdQuery, setThirdQuery] = import_react.default.useState("");
  const [builtinQuery, setBuiltinQuery] = import_react.default.useState("");
  const refresh = (silent) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    pmgr.list().then((data) => setState({ loading: false, error: null, data })).catch((e) => setState({ loading: false, error: String(e && e.message || e), data: null }));
  };
  import_react.default.useEffect(() => {
    refresh(true);
  }, []);
  const act = (method, args, label) => {
    setBusy(label);
    setNotice(null);
    pmgr[method](args).then((data) => {
      setNotice({
        kind: data && data.ok ? "ok" : "err",
        text: data && data.message || (data && data.ok ? "\u5B8C\u6210" : "\u5931\u8D25")
      });
      if (data && data.output) setNotice((n) => ({ ...n, output: data.output }));
      refresh(true);
    }).catch((e) => setNotice({ kind: "err", text: String(e && e.message || e) })).finally(() => setBusy(null));
  };
  const doInstall = () => {
    if (!spec.trim()) return;
    act("install", { spec: spec.trim() }, "install");
  };
  const d = state.data;
  const plugins = d && d.plugins ? d.plugins : [];
  const builtin = plugins.filter((p) => p.kind === "builtin");
  const third = plugins.filter((p) => p.kind === "third-party");
  const renderRow = (p) => {
    const stateBadge = p.missing ? import_react.default.createElement(Badge, { kind: "state-missing" }, "\u5931\u6548") : p.enabled ? import_react.default.createElement(Badge, { kind: "state-on" }, "\u5DF2\u542F\u7528") : p.mounted ? import_react.default.createElement(Badge, { kind: "state-off" }, "\u5DF2\u6302\u8F7D") : import_react.default.createElement(Badge, { kind: "state-off" }, "\u5DF2\u505C\u7528");
    const kindBadge = p.kind === "builtin" ? import_react.default.createElement(Badge, { kind: "kind-builtin" }, "\u5185\u7F6E") : import_react.default.createElement(Badge, { kind: "kind-third" }, "\u4E09\u65B9");
    const srcBadge = p.source === "github" ? import_react.default.createElement(Badge, null, "GitHub") : p.source === "npm" ? import_react.default.createElement(Badge, null, "npm") : null;
    const phase = p.runtime && p.runtime.fiberPhase ? import_react.default.createElement(Badge, null, "\u8FD0\u884C: " + p.runtime.fiberPhase) : null;
    const actions = [];
    if (p.kind === "third-party") {
      if (p.mounted) {
        actions.push(
          import_react.default.createElement(
            "button",
            {
              key: "toggle",
              className: "pmgr-btn",
              disabled: busy !== null,
              onClick: () => act(p.disabled ? "start" : "stop", { name: p.name }, p.name)
            },
            p.disabled ? "\u542F\u52A8" : "\u505C\u7528"
          )
        );
      } else if (p.isBundle && p.installed) {
        actions.push(
          import_react.default.createElement(
            "button",
            {
              key: "toggle",
              className: "pmgr-btn",
              disabled: busy !== null,
              onClick: () => act("start", { name: p.name }, p.name)
            },
            "\u88C5\u8F7D"
          )
        );
      }
      actions.push(
        import_react.default.createElement(
          "button",
          {
            key: "uninstall",
            className: "pmgr-btn danger",
            disabled: busy !== null,
            onClick: () => {
              if (window.confirm("\u786E\u5B9A\u5378\u8F7D\u63D2\u4EF6 " + p.name + " \u5417\uFF1F\uFF08\u91CD\u542F\u540E\u4E0D\u518D\u88C5\u8F7D\uFF09")) {
                act("uninstall", { name: p.name }, p.name);
              }
            }
          },
          "\u5378\u8F7D"
        )
      );
    }
    if (p.githubUrl) {
      actions.push(
        import_react.default.createElement(
          "a",
          {
            key: "gh",
            className: "pmgr-btn link",
            href: p.githubUrl,
            target: "_blank",
            rel: "noreferrer",
            title: p.githubUrl
          },
          "GitHub \u2197"
        )
      );
    }
    const busyThis = busy === p.name || busy === "install";
    return import_react.default.createElement(
      "div",
      { key: p.name, className: "pmgr-card" },
      import_react.default.createElement(
        "div",
        { className: "pmgr-card-row" },
        import_react.default.createElement("span", { className: "pmgr-name" }, p.name),
        p.version ? import_react.default.createElement("span", { className: "pmgr-ver" }, p.version) : null,
        kindBadge,
        stateBadge,
        srcBadge,
        phase,
        actions.length ? import_react.default.createElement("div", { className: "pmgr-actions" }, ...actions) : null
      ),
      p.description ? import_react.default.createElement("p", { className: "pmgr-desc" }, p.description) : null,
      p.spec && p.spec !== p.name ? import_react.default.createElement("p", { className: "pmgr-desc" }, "\u6765\u6E90: " + p.spec) : null,
      busyThis ? import_react.default.createElement("p", { className: "pmgr-desc" }, "\u5904\u7406\u4E2D\u2026") : null
    );
  };
  return import_react.default.createElement(
    "div",
    { className: "pmgr-root" },
    import_react.default.createElement(
      "div",
      { className: "pmgr-head" },
      import_react.default.createElement("h2", { className: "pmgr-title" }, "DSH \u63D2\u4EF6\u7BA1\u7406\u5668"),
      d && d.profile ? import_react.default.createElement(Badge, null, "profile: " + d.profile + " \xB7 " + d.profileDir) : null,
      d && d.counts ? import_react.default.createElement(Badge, null, "\u5185\u7F6E " + d.counts.builtin + " / \u4E09\u65B9 " + d.counts.thirdParty) : null,
      d ? import_react.default.createElement(
        Badge,
        null,
        "\u5DF2\u542F\u7528 " + plugins.filter((q) => q.enabled).length + " \xB7 \u5DF2\u6302\u8F7D " + plugins.filter((q) => q.mounted && q.disabled).length + " \xB7 \u5DF2\u505C\u7528 " + plugins.filter((q) => !q.mounted && !q.missing).length
      ) : null,
      import_react.default.createElement(
        "button",
        { className: "pmgr-btn", disabled: state.loading, onClick: () => refresh(false) },
        "\u5237\u65B0"
      )
    ),
    import_react.default.createElement(
      "div",
      { className: "pmgr-install" },
      import_react.default.createElement("input", {
        className: "pmgr-input",
        placeholder: "\u5B89\u88C5\uFF1A\u63D2\u4EF6\u540D / github:owner/repo#main / \u4EFB\u610F pnpm \u5305\u6807\u8BC6",
        value: spec,
        onChange: (e) => setSpec(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") doInstall();
        }
      }),
      import_react.default.createElement(
        "button",
        { className: "pmgr-btn primary", disabled: busy !== null || !spec.trim(), onClick: doInstall },
        busy === "install" ? "\u5B89\u88C5\u4E2D\u2026" : "\u5B89\u88C5"
      )
    ),
    notice ? import_react.default.createElement(
      "div",
      { className: "pmgr-notice " + notice.kind },
      notice.text,
      notice.output ? import_react.default.createElement("pre", { className: "pmgr-output" }, notice.output) : null
    ) : null,
    state.error ? import_react.default.createElement("div", { className: "pmgr-notice err" }, String(state.error)) : null,
    state.loading && !state.data ? import_react.default.createElement("div", { className: "pmgr-empty" }, "\u52A0\u8F7D\u4E2D\u2026") : null,
    // 三方插件（上移，默认展开）
    import_react.default.createElement(PluginGroup, {
      title: "\u4E09\u65B9\u63D2\u4EF6",
      count: third.length,
      open: thirdOpen,
      onToggle: () => setThirdOpen(!thirdOpen),
      query: thirdQuery,
      onQuery: setThirdQuery,
      plugins: third,
      renderRow
    }),
    // 内置插件（默认收起）
    import_react.default.createElement(PluginGroup, {
      title: "\u5185\u7F6E\u63D2\u4EF6",
      count: builtin.length,
      open: builtinOpen,
      onToggle: () => setBuiltinOpen(!builtinOpen),
      query: builtinQuery,
      onQuery: setBuiltinQuery,
      plugins: builtin,
      renderRow
    }),
    import_react.default.createElement(
      "p",
      { className: "pmgr-foot" },
      "\u8BF4\u660E\uFF1A\u5B89\u88C5 / \u5378\u8F7D\u901A\u8FC7 pnpm\uFF08dsh plugin\uFF09\u6267\u884C\uFF0C\u91CD\u542F\u540E\u751F\u6548\uFF1B\u505C\u7528 / \u542F\u52A8\u901A\u8FC7\u4FEE\u6539 profile \u7684 cordis.patch.yml\uFF08\u91CD\u542F\u540E\u751F\u6548\uFF0C\u82E5\u5F53\u524D\u8FDB\u7A0B HMR \u5DF2\u6FC0\u6D3B\u5219\u53EF\u80FD\u5373\u65F6\u751F\u6548\uFF09\u3002\u5185\u7F6E\u63D2\u4EF6\u5C5E\u4E8E DSH \u53D1\u884C\u7248\uFF0C\u53EA\u8BFB\u3002 \u4E09\u65B9\u63D2\u4EF6\u7684 GitHub \u94FE\u63A5\u53D6\u81EA\u4F9D\u8D56\u58F0\u660E\u6216\u5DF2\u5B89\u88C5\u5305\u7684 repository \u5B57\u6BB5\u3002"
    )
  );
}

// client/src/index.js
var inject = ["slots"];
function apply(ctx) {
  injectStyles();
  const slots = ctx.get("slots");
  if (slots === void 0) return;
  slots.inject(
    "settings.plugins.tab",
    () => slots.register(
      {
        name: "settings.plugins.tab",
        id: "pm-manage",
        order: 20,
        label: () => "\u63D2\u4EF6\u7BA1\u7406"
      },
      () => import_react2.default.createElement(PluginManagerTab, null)
    )
  );
}

    return module.exports;
  },
});

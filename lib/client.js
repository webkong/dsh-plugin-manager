window.__ModuleLoader__.load({
  id: '@webkong/dsh-plugin-manager',
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
.pmgr-head { display: flex; flex-direction: column; gap: 8px; }
.pmgr-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; }
.pmgr-title-row .pmgr-btn { margin-left: auto; }
.pmgr-status-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pmgr-title { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
.pmgr-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
.pmgr-toggle-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.pmgr-switch { position: relative; width: 34px; height: 19px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); cursor: pointer; padding: 0; transition: background 0.15s ease, border-color 0.15s ease; }
.pmgr-switch.on { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.pmgr-switch:disabled { opacity: 0.6; cursor: default; }
.pmgr-switch-knob { position: absolute; top: 2px; left: 2px; width: 13px; height: 13px; border-radius: 50%; background: #fff; transition: left 0.15s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.pmgr-switch.on .pmgr-switch-knob { left: 17px; }

/* \u5F39\u7A97 */
.pmgr-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.pmgr-modal { width: min(480px, calc(100vw - 48px)); max-height: 75vh; overflow: auto; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.2); }
.pmgr-modal.err { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2)); }
.pmgr-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pmgr-modal-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.pmgr-modal-close { border: none; background: none; font-size: 18px; line-height: 1; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); cursor: pointer; padding: 2px 6px; border-radius: 6px; }
.pmgr-modal-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.pmgr-modal-body { display: flex; flex-direction: column; gap: 8px; }
.pmgr-modal-text { margin: 0; font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-primary); white-space: pre-wrap; word-break: break-word; }
.pmgr-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.pmgr-install { display: flex; gap: 8px; align-items: center; }
.pmgr-input { flex: 1; min-width: 0; height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; }
.pmgr-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.pmgr-group { display: flex; flex-direction: column; gap: 12px; }
.pmgr-group-head { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; user-select: none; }
.pmgr-group-head:hover .pmgr-group-title { color: var(--dsw-alias-label-primary); }
.pmgr-group-toggle { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
/* \u641C\u7D22\u6846\u4E0E\u5B89\u88C5\u8F93\u5165\u6846\uFF08.pmgr-input\uFF09\u6837\u5F0F\u4E00\u81F4\uFF1B\u7EC4\u5185\u4E3A\u7EB5\u5411 flex\uFF0C\u7981\u6389 flex:1 \u9632\u6B62\u7EB5\u5411\u62C9\u4F38 */
.pmgr-search { flex: none; }
.pmgr-group-title { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; }
.pmgr-sub { display: flex; flex-direction: column; gap: 8px; }
.pmgr-sub-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); margin: 2px 0 0; }
.pmgr-sub-title::after { content: ''; flex: 1; height: 1px; background: var(--dsw-alias-border-l1); }

/* ---------- \u5361\u7247 ---------- */
.pmgr-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s ease; }
.pmgr-card:hover { border-color: var(--dsw-alias-border-l2); }

/* \u7B2C\u4E00\u5C42\uFF1AHeader = \u4FE1\u606F\u533A\uFF08\u5DE6\uFF09 + \u64CD\u4F5C\u533A\uFF08\u53F3\uFF09 */
.pmgr-card-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.pmgr-card-info { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.pmgr-card-title-row { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.pmgr-name { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.pmgr-ver { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); flex: none; }
.pmgr-card-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

/* \u8F7B\u91CF Badge\uFF1A\u9ED8\u8BA4\u4E2D\u6027\u7070\uFF1B\u5DF2\u542F\u7528\u6D45\u7EFF\u5E95\u6DF1\u7EFF\u5B57\uFF1B\u505C\u7528/\u5931\u6548\u5F31\u5316 */
.pmgr-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; font-size: 11px; line-height: 1; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); white-space: nowrap; }
.pmgr-badge.kind-third { color: var(--dsw-alias-brand-primary); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, var(--dsw-alias-border-l2)); }
.pmgr-badge.enabled { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, var(--dsw-alias-bg-layer-1)); }
.pmgr-badge.stopped { color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
.pmgr-badge.missing { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-layer-1)); }

/* Runtime \u72B6\u6001\uFF1A\u7EFF\u8272\u5C0F\u5706\u70B9 + \u5F31\u6587\u5B57 */
.pmgr-runtime { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 6px; font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); white-space: nowrap; }
.pmgr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-success-primary); flex: none; }
.pmgr-dot.off { background: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }

/* \u64CD\u4F5C\u533A\uFF1A\u505C\u7528/\u542F\u52A8 secondary\uFF1B\u5378\u8F7D\u5F31\u5316\u6587\u5B57\u6309\u94AE\uFF1BGitHub \u8F7B\u91CF\u94FE\u63A5 */
.pmgr-card-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.pmgr-btn { height: 28px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease; }
.pmgr-btn:hover:not(:disabled) { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.pmgr-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.pmgr-btn:disabled { opacity: 0.55; cursor: default; }
.pmgr-btn-sm { height: 26px; padding: 0 10px; font-size: 12px; border-radius: 6px; }
.pmgr-btn-sm.weak { height: 26px; padding: 0 10px; }
.pmgr-btn.weak { border: none; background: none; padding: 0 8px; color: var(--dsw-alias-label-secondary); }
.pmgr-btn.weak:hover:not(:disabled) { color: var(--dsw-alias-state-error-primary); }
.pmgr-btn.weak:focus-visible { outline: 2px solid var(--dsw-alias-state-error-primary); outline-offset: 1px; }
.pmgr-btn.link { border: none; background: none; padding: 0 6px; color: var(--dsw-alias-brand-primary); text-decoration: none; }
.pmgr-btn.link:hover { text-decoration: underline; }

/* \u7B2C\u4E8C\u5C42\uFF1A\u63CF\u8FF0\uFF08\u6700\u591A\u4E24\u884C\uFF0C\u8D85\u51FA line-clamp\uFF1B\u65E0\u63CF\u8FF0\u65F6\u4E0D\u6E32\u67D3\uFF09 */
.pmgr-card-desc { font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-secondary); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* \u7B2C\u4E09\u5C42\uFF1A\u6765\u6E90 metadata footer */
.pmgr-card-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); min-width: 0; }
.pmgr-meta-label { flex: none; }
.pmgr-meta-sep { color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); opacity: 0.7; }
.pmgr-meta-link { color: inherit; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pmgr-meta-link:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.pmgr-meta-hash { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: nowrap; }
.pmgr-meta-gh { margin-left: auto; font-size: 11px; color: var(--dsw-alias-brand-primary); text-decoration: none; white-space: nowrap; }
.pmgr-meta-gh:hover { text-decoration: underline; }

.pmgr-notice { font-size: 12px; border-radius: 8px; padding: 8px 10px; line-height: 1.5; }
.pmgr-notice.ok { color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.pmgr-notice.err { color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.pmgr-output { font-size: 11px; font-family: ui-monospace, monospace; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 6px; padding: 8px; max-height: 180px; overflow: auto; margin: 0; }
.pmgr-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); padding: 12px 0; }
.pmgr-foot { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); line-height: 1.6; margin: 0; }

/* \u54CD\u5E94\u5F0F\uFF1A\u4E2D\u7B49\u5BBD\u5EA6\u64CD\u4F5C\u533A\u6362\u884C\u6210\u7EC4\uFF1B\u7A84\u5C4F actions \u79FB\u5230\u5E95\u90E8\u6574\u884C */
@media (max-width: 860px) {
  .pmgr-card-header { align-items: flex-start; }
  .pmgr-card-actions { flex-wrap: wrap; justify-content: flex-end; }
}
@media (max-width: 640px) {
  .pmgr-card-header { flex-direction: column; align-items: stretch; gap: 10px; }
  .pmgr-card-actions { justify-content: flex-start; flex-wrap: wrap; }
  .pmgr-card { padding: 14px 16px; }
}
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
  install: (payload) => call("/pmgr/install", payload),
  uninstall: (payload) => call("/pmgr/uninstall", payload),
  stop: (payload) => call("/pmgr/stop", payload),
  start: (payload) => call("/pmgr/start", payload),
  setSettings: (payload) => call("/pmgr/settings", payload),
  restart: () => call("/pmgr/restart")
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
function refFromSpec(spec) {
  if (!spec) return "";
  const m = String(spec).match(/#([^@\s]+)$/);
  return m ? m[1] : "";
}
function isCommitHash(ref) {
  return /^[a-f0-9]{40}$/i.test(ref);
}
function shortRef(ref) {
  if (!ref) return "";
  return isCommitHash(ref) ? ref.slice(0, 8) : ref;
}
function repoFromUrl(url) {
  const m = String(url || "").match(/github\.com\/([^/]+\/[^/?#]+)/);
  return m ? m[1] : "";
}
function Badge(props) {
  return import_react.default.createElement("span", { className: "pmgr-badge " + (props.kind || "") }, props.children);
}
function RuntimeDot(props) {
  const { phase } = props;
  const active = phase === "active";
  return import_react.default.createElement(
    "span",
    { className: "pmgr-runtime" },
    import_react.default.createElement("span", { className: "pmgr-dot" + (active ? "" : " off") }),
    active ? "\u8FD0\u884C\u4E2D" : phase ? String(phase) : "\u672A\u8FD0\u884C"
  );
}
function CardMeta(props) {
  const { p } = props;
  const ghLink = p.githubUrl ? import_react.default.createElement(
    "a",
    {
      key: "gh",
      className: "pmgr-meta-gh",
      href: p.githubUrl,
      target: "_blank",
      rel: "noreferrer",
      title: p.githubUrl
    },
    "GitHub \u2197"
  ) : null;
  const meta = [];
  if (p.source === "github" && p.githubUrl) {
    const repo = repoFromUrl(p.githubUrl);
    const ref = refFromSpec(p.spec);
    const short = shortRef(ref);
    meta.push(
      import_react.default.createElement("span", { key: "label", className: "pmgr-meta-label" }, "\u6765\u6E90"),
      import_react.default.createElement("span", { key: "sep1", className: "pmgr-meta-sep" }, "\xB7"),
      import_react.default.createElement(
        "a",
        { key: "repo", className: "pmgr-meta-link", href: p.githubUrl, target: "_blank", rel: "noreferrer", title: p.githubUrl },
        "GitHub \xB7 " + repo
      )
    );
    if (ref) {
      meta.push(
        import_react.default.createElement(
          "span",
          { key: "ref", className: "pmgr-meta-hash", title: isCommitHash(ref) ? "\u5B8C\u6574 commit: " + ref : "" },
          "\xB7 " + short
        )
      );
    }
  } else if (p.source === "npm") {
    meta.push(
      import_react.default.createElement("span", { key: "label", className: "pmgr-meta-label" }, "\u6765\u6E90"),
      import_react.default.createElement("span", { key: "sep1", className: "pmgr-meta-sep" }, "\xB7"),
      import_react.default.createElement("span", { key: "body", className: "pmgr-meta-hash" }, "npm" + (p.name ? " \xB7 " + p.name : ""))
    );
  } else if (p.source === "local") {
    meta.push(
      import_react.default.createElement("span", { key: "label", className: "pmgr-meta-label" }, "\u6765\u6E90"),
      import_react.default.createElement("span", { key: "sep1", className: "pmgr-meta-sep" }, "\xB7"),
      import_react.default.createElement("span", { key: "body" }, "\u672C\u5730\u8DEF\u5F84")
    );
  }
  if (ghLink) meta.push(ghLink);
  return meta.length ? import_react.default.createElement("div", { className: "pmgr-card-meta" }, ...meta) : null;
}
function PluginGroup(props) {
  const { title, count, open, onToggle, query, onQuery, plugins, renderRow } = props;
  const filtered = plugins.filter((p) => fuzzyMatch(p.name + " " + (p.description || ""), query));
  const running = filtered.filter((p) => !p.missing && p.enabled);
  const stopped = filtered.filter((p) => !p.missing && !p.enabled);
  const missing = filtered.filter((p) => p.missing);
  const sections = [];
  if (running.length) sections.push({ key: "running", label: "\u8FD0\u884C\u4E2D", list: running });
  if (stopped.length) sections.push({ key: "stopped", label: "\u5DF2\u505C\u7528", list: stopped });
  if (missing.length) sections.push({ key: "missing", label: "\u5931\u6548", list: missing });
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
      sections.length ? sections.map(
        (sec) => import_react.default.createElement(
          "div",
          { key: sec.key, className: "pmgr-sub" },
          import_react.default.createElement("h4", { className: "pmgr-sub-title" }, sec.label + "\uFF08" + sec.list.length + "\uFF09"),
          sec.list.map(renderRow)
        )
      ) : import_react.default.createElement("div", { className: "pmgr-empty" }, "\u65E0\u5339\u914D")
    ) : null
  );
}
function PluginManagerTab() {
  const [state, setState] = import_react.default.useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = import_react.default.useState(null);
  const [spec, setSpec] = import_react.default.useState("");
  const [modal, setModal] = import_react.default.useState(null);
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
  const METHOD_LABELS = { install: "\u5B89\u88C5", uninstall: "\u5378\u8F7D", stop: "\u505C\u7528", start: "\u542F\u52A8", setSettings: "\u8BBE\u7F6E", restart: "\u91CD\u542F" };
  const act = (method, args, label) => {
    setBusy(label);
    setModal(null);
    pmgr[method](args).then((data) => {
      const name = METHOD_LABELS[method] || method;
      if (data && data.ok) {
        if (data.restarting) {
          setModal({ kind: "ok", title: name + "\u6210\u529F", text: data.message || "", output: data.output || null });
        } else {
          setModal({ kind: "ok", title: name + "\u6210\u529F", text: data.message || "\u5B8C\u6210", output: data.output || null, pendingRestart: method === "install" || method === "uninstall" });
          refresh(true);
        }
      } else {
        setModal({ kind: "err", title: name + "\u5931\u8D25", text: data && data.message || "\u64CD\u4F5C\u5931\u8D25", output: data && data.output || null });
      }
    }).catch((e) => setModal({ kind: "err", title: "\u64CD\u4F5C\u5931\u8D25", text: String(e && e.message || e), output: null })).finally(() => setBusy(null));
  };
  const doInstall = () => {
    if (!spec.trim()) return;
    act("install", { spec: spec.trim() }, "install");
  };
  const d = state.data;
  const plugins = d && d.plugins ? d.plugins : [];
  const builtin = plugins.filter((p) => p.kind === "builtin");
  const third = plugins.filter((p) => p.kind === "third-party");
  const autoRestart = !!(d && d.settings && d.settings.autoRestart);
  const toggleAutoRestart = () => {
    setBusy("settings");
    pmgr.setSettings({ autoRestart: !autoRestart }).then((res) => {
      if (res && res.ok && res.settings) {
        setState((prev) => ({ ...prev, data: { ...prev.data, settings: res.settings } }));
      }
    }).catch(() => {
    }).finally(() => setBusy(null));
  };
  const doRestartNow = () => {
    setModal(null);
    setBusy("restart");
    pmgr.restart().then((res) => {
      if (res && res.ok) {
        setModal({ kind: "ok", title: "\u91CD\u542F\u4E2D", text: res.message || "\u6B63\u5728\u91CD\u542F dsh web\u2026", output: null });
      } else {
        setModal({ kind: "err", title: "\u91CD\u542F\u5931\u8D25", text: res && res.message || "\u65E0\u6CD5\u89E6\u53D1\u91CD\u542F", output: null });
      }
    }).catch((e) => setModal({ kind: "err", title: "\u91CD\u542F\u5931\u8D25", text: String(e && e.message || e), output: null })).finally(() => setBusy(null));
  };
  const renderRow = (p) => {
    const stateBadge = p.missing ? import_react.default.createElement(Badge, { kind: "missing" }, "\u5931\u6548") : p.enabled ? import_react.default.createElement(Badge, { kind: "enabled" }, "\u5DF2\u542F\u7528") : import_react.default.createElement(Badge, { kind: "stopped" }, "\u5DF2\u505C\u7528");
    const runtimeDot = p.mounted && p.enabled && p.runtime ? import_react.default.createElement(RuntimeDot, { phase: p.runtime.fiberPhase }) : null;
    const kindBadge = p.kind === "builtin" ? import_react.default.createElement(Badge, null, "\u5185\u7F6E") : import_react.default.createElement(Badge, { kind: "kind-third" }, "\u7B2C\u4E09\u65B9");
    const srcBadge = p.source === "github" ? import_react.default.createElement(Badge, null, "GitHub") : p.source === "npm" ? import_react.default.createElement(Badge, null, "npm") : null;
    const actions = [];
    if (p.kind === "third-party") {
      if (p.mounted) {
        actions.push(
          import_react.default.createElement(
            "button",
            {
              key: "toggle",
              className: "pmgr-btn pmgr-btn-sm",
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
              className: "pmgr-btn pmgr-btn-sm",
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
            className: "pmgr-btn pmgr-btn-sm weak",
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
    const busyThis = busy === p.name || busy === "install";
    return import_react.default.createElement(
      "div",
      { key: p.name, className: "pmgr-card" },
      // 第一层：Header
      import_react.default.createElement(
        "div",
        { className: "pmgr-card-header" },
        import_react.default.createElement(
          "div",
          { className: "pmgr-card-info" },
          import_react.default.createElement(
            "div",
            { className: "pmgr-card-title-row" },
            import_react.default.createElement("span", { className: "pmgr-name", title: p.name }, p.name),
            p.version ? import_react.default.createElement("span", { className: "pmgr-ver" }, p.version) : null
          ),
          import_react.default.createElement(
            "div",
            { className: "pmgr-card-badges" },
            kindBadge,
            srcBadge,
            stateBadge,
            runtimeDot
          )
        ),
        import_react.default.createElement("div", { className: "pmgr-card-actions" }, ...actions)
      ),
      // 第二层：描述（无描述不渲染，避免空白占位）
      p.description ? import_react.default.createElement("p", { className: "pmgr-card-desc", title: p.description }, p.description) : null,
      // 第三层：来源 metadata
      import_react.default.createElement(CardMeta, { p }),
      busyThis ? import_react.default.createElement("p", { className: "pmgr-foot" }, "\u5904\u7406\u4E2D\u2026") : null
    );
  };
  return import_react.default.createElement(
    "div",
    { className: "pmgr-root" },
    import_react.default.createElement(
      "div",
      { className: "pmgr-head" },
      import_react.default.createElement(
        "div",
        { className: "pmgr-title-row" },
        import_react.default.createElement("h2", { className: "pmgr-title" }, "DSH \u63D2\u4EF6\u7BA1\u7406\u5668"),
        d && d.profile ? import_react.default.createElement(Badge, null, "profile: " + d.profile + " \xB7 " + d.profileDir) : null,
        import_react.default.createElement(
          "button",
          { className: "pmgr-btn", disabled: state.loading, onClick: () => refresh(false) },
          "\u5237\u65B0"
        )
      ),
      import_react.default.createElement(
        "div",
        { className: "pmgr-status-row" },
        d && d.counts ? import_react.default.createElement(Badge, null, "\u5185\u7F6E " + d.counts.builtin + " / \u4E09\u65B9 " + d.counts.thirdParty) : null,
        d ? import_react.default.createElement(
          Badge,
          null,
          "\u5DF2\u542F\u7528 " + plugins.filter((q) => q.enabled).length + " \xB7 \u5DF2\u505C\u7528 " + plugins.filter((q) => !q.enabled && !q.missing).length + " \xB7 \u5931\u6548 " + plugins.filter((q) => q.missing).length
        ) : null,
        import_react.default.createElement(
          "label",
          { className: "pmgr-toggle" },
          import_react.default.createElement("span", { className: "pmgr-toggle-label" }, "\u81EA\u52A8\u91CD\u542F"),
          import_react.default.createElement(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": autoRestart,
              className: "pmgr-switch" + (autoRestart ? " on" : ""),
              disabled: busy !== null,
              onClick: toggleAutoRestart
            },
            import_react.default.createElement("span", { className: "pmgr-switch-knob" })
          )
        )
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
        { className: "pmgr-btn", disabled: busy !== null || !spec.trim(), onClick: doInstall },
        busy === "install" ? "\u5B89\u88C5\u4E2D\u2026" : "\u5B89\u88C5"
      )
    ),
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
    modal ? import_react.default.createElement(
      "div",
      { className: "pmgr-modal-backdrop", onClick: () => setModal(null) },
      import_react.default.createElement(
        "div",
        { className: "pmgr-modal" + (modal.kind === "err" ? " err" : ""), onClick: (e) => e.stopPropagation() },
        import_react.default.createElement(
          "div",
          { className: "pmgr-modal-head" },
          import_react.default.createElement("h3", { className: "pmgr-modal-title" }, modal.title),
          import_react.default.createElement("button", { className: "pmgr-modal-close", onClick: () => setModal(null), "aria-label": "\u5173\u95ED" }, "\xD7")
        ),
        import_react.default.createElement(
          "div",
          { className: "pmgr-modal-body" },
          import_react.default.createElement("p", { className: "pmgr-modal-text" }, modal.text),
          modal.output ? import_react.default.createElement("pre", { className: "pmgr-output" }, modal.output) : null
        ),
        import_react.default.createElement(
          "div",
          { className: "pmgr-modal-actions" },
          modal.pendingRestart ? import_react.default.createElement("button", { className: "pmgr-btn", onClick: doRestartNow, disabled: busy !== null }, "\u7ACB\u5373\u91CD\u542F") : null,
          import_react.default.createElement("button", { className: "pmgr-btn pmgr-btn-sm", onClick: () => setModal(null) }, "\u786E\u5B9A")
        )
      )
    ) : null,
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

window.__ModuleLoader__.load({
  id: '@webkong/dsh-plugin-manager',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
"use strict";
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

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  NS: () => NS,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react4 = __toESM(require("react"), 1);

// src/client/styles.css
var styles_default = "\n.pmgr-root { display: flex; flex-direction: column; gap: 12px; padding: 4px 2px 24px; }\n\n/* \u5934\u90E8 */\n.pmgr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }\n.pmgr-title { font-size: 16px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }\n.pmgr-profile { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }\n\n/* \u72B6\u6001\u7B5B\u9009 Tabs */\n.pmgr-tabs { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; border-bottom: 1px solid var(--dsw-alias-border-l1); padding-bottom: 2px; }\n.pmgr-tab { border: none; background: none; padding: 6px 10px; font-size: 13px; color: var(--dsw-alias-label-secondary); cursor: pointer; border-radius: 6px 6px 0 0; border-bottom: 2px solid transparent; }\n.pmgr-tab:hover { color: var(--dsw-alias-label-primary); }\n.pmgr-tab.active { color: var(--dsw-alias-label-primary); font-weight: 600; border-bottom-color: var(--dsw-alias-brand-primary); }\n\n/* \u5DE5\u5177\u680F */\n.pmgr-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }\n.pmgr-toolbar-search { flex: 1; min-width: 160px; }\n.pmgr-select { height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 8px; font-size: 12px; cursor: pointer; }\n\n/* \u8F93\u5165\u4E0E\u6309\u94AE */\n.pmgr-input { flex: 1; min-width: 0; height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; }\n.pmgr-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }\n.pmgr-btn { height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease; }\n.pmgr-btn:hover:not(:disabled) { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }\n.pmgr-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }\n.pmgr-btn:disabled { opacity: 0.55; cursor: default; }\n.pmgr-btn-sm { height: 26px; padding: 0 10px; font-size: 12px; border-radius: 6px; }\n.pmgr-btn-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: #fff; }\n.pmgr-btn-primary:hover:not(:disabled) { color: #fff; filter: brightness(1.05); }\n.pmgr-btn.danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }\n.pmgr-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent); }\n\n/* \u5206\u7EC4 */\n.pmgr-group { display: flex; flex-direction: column; gap: 8px; }\n.pmgr-group-head { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; user-select: none; }\n.pmgr-group-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }\n.pmgr-group-toggle { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }\n\n/* \u63D2\u4EF6\u5361\u7247 */\n.pmgr-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.15s ease; }\n.pmgr-card:hover { border-color: var(--dsw-alias-border-l2); }\n.pmgr-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }\n.pmgr-card-name { display: flex; align-items: baseline; gap: 10px; min-width: 0; }\n.pmgr-name { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; padding:3px 0; }\n.pmgr-version { font-size: 12px; font-weight: 400; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); text-decoration: underline; flex: none; }\n.pmgr-version:hover { color: var(--dsw-alias-brand-primary); }\n.pmgr-version-arrow { font-size: 11px; margin-left: 1px; opacity: 0.85; }\n.pmgr-state { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; white-space: nowrap; flex: none; }\n.pmgr-state-running { color: var(--dsw-alias-state-success-primary); }\n.pmgr-state-stopped { color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }\n.pmgr-state-error { color: var(--dsw-alias-state-error-primary); font-weight: 600; }\n.pmgr-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }\n.pmgr-tag { display: inline-flex; align-items: center; font-size: 11px; line-height: 1; padding: 6px 10px; border-radius: 16px; border: 1px solid var(--dsw-alias-border-l4); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }\n.pmgr-tag-third { border-color: var(--dsw-alias-border-l4); color: var(--dsw-alias-brand-primary); }\n.pmgr-card-body { display: flex; align-items: flex-start; gap: 12px; }\n.pmgr-card-desc-wrap { flex: 1; min-width: 0; }\n.pmgr-card-desc { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n.pmgr-card-actions { flex: none; display: flex; align-items: center; gap: 6px; }\n\n/* \u5F39\u7A97 */\n@keyframes pmgr-fade-in { from { opacity: 0 } to { opacity: 1 } }\n@keyframes pmgr-pop-in { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }\n@keyframes pmgr-spin { to { transform: rotate(360deg) } }\n.pmgr-spinner { width: 16px; height: 16px; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); border-radius: 50%; animation: pmgr-spin 0.8s linear infinite; flex: none; }\n.pmgr-modal-loading { flex-direction: row; align-items: center; gap: 10px; padding: 18px 20px; }\n.pmgr-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: pmgr-fade-in 0.15s ease; }\n.pmgr-modal { width: min(480px, calc(100vw - 48px)); max-height: 80vh; overflow: auto; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.2); animation: pmgr-pop-in 0.18s ease; }\n.pmgr-modal.err { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2)); }\n.pmgr-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\n.pmgr-modal-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }\n.pmgr-modal-close { border: none; background: none; font-size: 18px; line-height: 1; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); cursor: pointer; padding: 2px 6px; border-radius: 6px; }\n.pmgr-modal-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }\n.pmgr-modal-body { display: flex; flex-direction: column; gap: 8px; }\n.pmgr-modal-text { margin: 0; font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-primary); white-space: pre-wrap; word-break: break-word; }\n.pmgr-countdown { margin: 0; font-size: 12px; font-weight: 600; color: var(--dsw-alias-brand-primary); }\n.pmgr-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }\n\n/* \u5B89\u88C5\u5F39\u7A97 */\n.pmgr-install-dialog { width: min(520px, calc(100vw - 48px)); min-height:190px; }\n.pmgr-install-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--dsw-alias-border-l1); }\n.pmgr-install-tab { border: none; background: none; padding: 6px 12px; font-size: 13px; color: var(--dsw-alias-label-secondary); cursor: pointer; border-bottom: 2px solid transparent; }\n.pmgr-install-tab.active { color: var(--dsw-alias-label-primary); font-weight: 600; border-bottom-color: var(--dsw-alias-brand-primary); }\n.pmgr-install-form { display: flex; flex-direction: column; gap: 10px; }\n.pmgr-field-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }\n.pmgr-check { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); cursor: pointer; }\n.pmgr-install { display: flex; gap: 8px; align-items: center; }\n\n/* \u641C\u7D22\u7ED3\u679C */\n.pmgr-search-results { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow: auto; }\n.pmgr-resolve { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow: auto; }\n.pmgr-search-item { display: flex; align-items: center; gap: 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 10px 12px; }\n.pmgr-search-item:hover { border-color: var(--dsw-alias-border-l2); }\n.pmgr-search-item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }\n.pmgr-search-item-name { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.pmgr-search-item-name:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }\n.pmgr-search-item-stars { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }\n.pmgr-search-item-desc { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 2px 0 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n\n/* \u63D0\u793A */\n.pmgr-notice { font-size: 12px; border-radius: 8px; padding: 8px 10px; line-height: 1.5; }\n.pmgr-notice.ok { color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }\n.pmgr-notice.err { color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }\n.pmgr-hint { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); line-height: 1.5; }\n.pmgr-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); padding: 12px 0; }\n.pmgr-output { font-size: 11px; font-family: ui-monospace, monospace; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 6px; padding: 8px; max-height: 180px; overflow: auto; margin: 0; }\n.pmgr-foot { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); line-height: 1.6; margin: 0; }\n\n/* \u91CD\u542F\u5B8C\u6210 toast */\n.pmgr-toast { position: fixed; top: 16px; right: 16px; z-index: 3000; display: flex; align-items: center; gap: 10px; max-width: 360px; padding: 10px 14px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); box-shadow: 0 8px 24px rgba(0,0,0,0.16); font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-primary); pointer-events: auto; animation: pmgr-pop-in 0.18s ease; }\n.pmgr-toast-text { flex: 1; min-width: 0; }\n.pmgr-toast-action { flex: none; height: 26px; padding: 0 10px; border: 1px solid var(--dsw-alias-brand-primary); background: var(--dsw-alias-brand-primary); color: #fff; border-radius: 6px; font-size: 12px; cursor: pointer; }\n.pmgr-toast-action:hover { filter: brightness(1.05); }\n.pmgr-toast-close { border: none; background: none; font-size: 16px; line-height: 1; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); cursor: pointer; padding: 2px 6px; border-radius: 6px; flex: none; }\n.pmgr-toast-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }\n\n/* \u54CD\u5E94\u5F0F */\n@media (max-width: 640px) {\n  .pmgr-toolbar { flex-direction: column; align-items: stretch; }\n  .pmgr-toolbar-search { flex: none; }\n}\n";

// src/client/styles.ts
var STYLE_ID = "dsh-plugin-manager/pmgr.css";
function injectStyles() {
  if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-plugin-manager";
    tag.dataset.pluginCss = STYLE_ID;
    tag.textContent = styles_default;
    document.head.appendChild(tag);
  }
}

// src/client/ui.tsx
var import_react3 = __toESM(require("react"), 1);

// src/client/api.ts
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
  search: (payload) => call("/pmgr/search", payload),
  resolve: (payload) => call("/pmgr/resolve", payload),
  restart: () => call("/pmgr/restart", {})
};

// src/client/toast.tsx
var import_react = __toESM(require("react"), 1);
var RESTART_TOAST_KEY = "dsh-plugin-manager:restart-toast";
function markRestartPending() {
  try {
    localStorage.setItem(RESTART_TOAST_KEY, "1");
  } catch {
  }
}
function waitForSelector(selector, timeout = 3e3) {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      let el = null;
      try {
        el = document.querySelector(selector);
      } catch {
      }
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - started >= timeout) {
        resolve(null);
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}
async function jumpToPluginTab() {
  try {
    const trigger = document.querySelector('button[aria-haspopup="dialog"]');
    if (!trigger) return false;
    trigger.click();
    const dialog = await waitForSelector('[role="dialog"][aria-modal="true"]');
    if (!dialog) return false;
    const sectionButtons = Array.from(dialog.querySelectorAll("nav button"));
    const pluginSection = sectionButtons.find((b) => {
      const txt = (b.textContent || "").trim();
      return txt.includes("\u63D2\u4EF6") || txt.includes("Plugins");
    });
    if (!pluginSection) return false;
    pluginSection.click();
    const tab = await waitForSelector('[id$="-tab-pm-manage"]');
    if (!tab) return false;
    tab.click();
    return true;
  } catch {
    return false;
  }
}
function RestartToast({ t }) {
  const [visible, setVisible] = import_react.default.useState(() => {
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem(RESTART_TOAST_KEY) === "1") {
        localStorage.removeItem(RESTART_TOAST_KEY);
        return true;
      }
    } catch {
    }
    return false;
  });
  import_react.default.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 8e3);
    return () => clearTimeout(timer);
  }, [visible]);
  if (!visible) return null;
  const handleJump = () => {
    void jumpToPluginTab();
    setVisible(false);
  };
  return import_react.default.createElement(
    "div",
    { className: "pmgr-toast", role: "status" },
    import_react.default.createElement("span", { className: "pmgr-toast-text" }, t("restartToast")),
    import_react.default.createElement("button", { className: "pmgr-toast-action", onClick: handleJump }, t("goView")),
    import_react.default.createElement("button", { className: "pmgr-toast-close", onClick: () => setVisible(false), "aria-label": "\xD7" }, "\xD7")
  );
}

// src/client/components.tsx
var import_react2 = __toESM(require("react"), 1);

// src/client/spec.ts
var GITHUB_SPEC = /^github:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[^\s]+)?$/;
var GITHUB_SHORTHAND = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[^\s]+)?$/;
var NPM_SPEC = /^(@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(?:@[^@\s]+)?$/;
var LOCAL_SPEC = /^(file|link):.+|^\.{1,2}\/.+|^\/.+/;
var URL_SPEC = /^https?:\/\/[^\s]+/;
function isBareName(spec) {
  return typeof spec === "string" && /^[a-z0-9][a-z0-9._~-]*$/.test(spec.trim());
}
function validateSpec(spec) {
  if (typeof spec !== "string" || spec.trim() === "") {
    return { ok: false, error: "\u63D2\u4EF6\u6807\u8BC6\u4E0D\u80FD\u4E3A\u7A7A" };
  }
  const s = spec.trim();
  if (/\s/.test(s)) {
    return { ok: false, error: "\u63D2\u4EF6\u6807\u8BC6\u4E0D\u80FD\u5305\u542B\u7A7A\u683C" };
  }
  if (GITHUB_SPEC.test(s) || GITHUB_SHORTHAND.test(s) || NPM_SPEC.test(s) || LOCAL_SPEC.test(s) || URL_SPEC.test(s)) {
    return { ok: true, error: "" };
  }
  return { ok: false, error: "\u63D2\u4EF6\u6807\u8BC6\u683C\u5F0F\u4E0D\u6B63\u786E\uFF08\u652F\u6301 npm \u5305\u540D / github:owner/repo#ref / \u672C\u5730\u8DEF\u5F84 / tarball URL\uFF09" };
}

// src/client/components.tsx
function RuntimeState({ t, p }) {
  if (p.missing) {
    return import_react2.default.createElement("span", { className: "pmgr-state pmgr-state-error" }, "\u25CF " + t("stateFailed"));
  }
  if (p.enabled) {
    return import_react2.default.createElement("span", { className: "pmgr-state pmgr-state-running" }, "\u25CF " + t("stateRunning"));
  }
  return import_react2.default.createElement("span", { className: "pmgr-state pmgr-state-stopped" }, t("stateStopped"));
}
function StatusTabs({ t, counts, active, onChange }) {
  const tabs = [
    ["all", t("statusAll"), counts.all],
    ["running", t("statusRunning"), counts.running],
    ["stopped", t("statusStopped"), counts.stopped],
    ["error", t("statusError"), counts.error]
  ];
  return import_react2.default.createElement(
    "div",
    { className: "pmgr-tabs" },
    tabs.map(
      ([key, label, count]) => import_react2.default.createElement(
        "button",
        { key, className: "pmgr-tab" + (active === key ? " active" : ""), onClick: () => onChange(key) },
        label + " " + count
      )
    )
  );
}
function PluginToolbar({ t, search, onSearch, source, onSource, onInstall }) {
  const sources = [
    ["all", t("sourceAll")],
    ["builtin", t("sourceBuiltin")],
    ["third-party", t("sourceThird")],
    ["npm", t("sourceNpm")],
    ["local", t("sourceLocal")],
    ["github", t("sourceGithub")]
  ];
  return import_react2.default.createElement(
    "div",
    { className: "pmgr-toolbar" },
    import_react2.default.createElement("input", {
      className: "pmgr-input pmgr-toolbar-search",
      placeholder: t("searchInstalled"),
      value: search,
      onChange: (e) => onSearch(e.target.value)
    }),
    import_react2.default.createElement(
      "select",
      { className: "pmgr-select", value: source, onChange: (e) => onSource(e.target.value) },
      sources.map(([k, l]) => import_react2.default.createElement("option", { key: k, value: k }, l))
    ),
    import_react2.default.createElement("button", { className: "pmgr-btn pmgr-btn-primary", onClick: onInstall }, "+ " + t("installPlugin"))
  );
}
function InstallDialog({ t, open, onClose, autoRestart, onToggleAutoRestart, busy, onInstall }) {
  const [mode, setMode] = import_react2.default.useState("direct");
  const [spec, setSpec] = import_react2.default.useState("");
  const [err, setErr] = import_react2.default.useState("");
  const [gq, setGq] = import_react2.default.useState("");
  const [results, setResults] = import_react2.default.useState(null);
  const [searching, setSearching] = import_react2.default.useState(false);
  const [resolving, setResolving] = import_react2.default.useState(false);
  const [resolved, setResolved] = import_react2.default.useState(null);
  if (!open) return null;
  const doInstall = () => {
    const check = validateSpec(spec);
    if (!check.ok) {
      setErr(check.error);
      return;
    }
    setErr("");
    const clean = spec.trim();
    if (isBareName(clean)) {
      resolveBare(clean);
    } else {
      onInstall(clean);
    }
  };
  const resolveBare = (name) => {
    setResolving(true);
    setResolved(null);
    pmgr.resolve({ name }).then((d) => {
      if (!d || !d.ok) {
        setErr(d && d.message || t("opFailed"));
        return;
      }
      if (d.type === "npm") {
        onInstall(name);
        return;
      }
      if (d.type === "github") {
        setResolved(d);
        return;
      }
      setErr(t("resolveNotFound", { name }));
    }).catch((e) => setErr(String(e.message || e))).finally(() => setResolving(false));
  };
  const doSearch = () => {
    setSearching(true);
    pmgr.search({ q: gq }).then((d) => setResults(d)).catch((e) => setResults({ ok: false, message: String(e.message || e), items: [] })).finally(() => setSearching(false));
  };
  const renderRepoItem = (r) => import_react2.default.createElement(
    "div",
    { key: r.fullName, className: "pmgr-search-item" },
    import_react2.default.createElement(
      "div",
      { className: "pmgr-search-item-info" },
      import_react2.default.createElement("a", { className: "pmgr-search-item-name", href: r.htmlUrl, target: "_blank", rel: "noreferrer", title: r.fullName }, r.fullName),
      import_react2.default.createElement("span", { className: "pmgr-search-item-stars" }, "\u2B50 " + r.stars),
      r.description ? import_react2.default.createElement("p", { className: "pmgr-search-item-desc" }, r.description) : null
    ),
    import_react2.default.createElement(
      "button",
      { className: "pmgr-btn pmgr-btn-sm", disabled: busy !== null, onClick: () => onInstall("github:" + r.fullName + "#" + r.defaultBranch) },
      t("install")
    )
  );
  return import_react2.default.createElement(
    "div",
    { className: "pmgr-modal-backdrop", onClick: onClose },
    import_react2.default.createElement(
      "div",
      { className: "pmgr-modal pmgr-install-dialog", onClick: (e) => e.stopPropagation() },
      import_react2.default.createElement(
        "div",
        { className: "pmgr-modal-head" },
        import_react2.default.createElement("h3", { className: "pmgr-modal-title" }, t("installTitle")),
        import_react2.default.createElement("button", { className: "pmgr-modal-close", onClick: onClose, "aria-label": "\xD7" }, "\xD7")
      ),
      import_react2.default.createElement(
        "div",
        { className: "pmgr-install-tabs" },
        import_react2.default.createElement("button", { className: "pmgr-install-tab" + (mode === "direct" ? " active" : ""), onClick: () => setMode("direct") }, t("installDirect")),
        import_react2.default.createElement("button", { className: "pmgr-install-tab" + (mode === "github" ? " active" : ""), onClick: () => setMode("github") }, t("installGithub"))
      ),
      mode === "direct" ? import_react2.default.createElement(
        "div",
        { className: "pmgr-install-form" },
        import_react2.default.createElement(
          "div",
          { className: "pmgr-install" },
          import_react2.default.createElement("input", {
            className: "pmgr-input",
            placeholder: t("specPlaceholder"),
            value: spec,
            autoFocus: true,
            onChange: (e) => {
              setSpec(e.target.value);
              setResolved(null);
              setErr("");
            },
            onKeyDown: (e) => {
              if (e.key === "Enter") doInstall();
            }
          }),
          import_react2.default.createElement(
            "button",
            { className: "pmgr-btn pmgr-btn-primary", disabled: busy !== null || resolving, onClick: doInstall },
            resolving ? t("resolving") : busy === "install" ? t("installing") : t("install")
          )
        ),
        err ? import_react2.default.createElement("div", { className: "pmgr-notice err" }, err) : null,
        resolved && resolved.type === "github" ? import_react2.default.createElement(
          "div",
          { className: "pmgr-resolve" },
          import_react2.default.createElement("div", { className: "pmgr-notice" }, t("resolveGithubHint", { name: spec.trim() })),
          (resolved.candidates || []).map(renderRepoItem),
          resolved.noToken ? import_react2.default.createElement("div", { className: "pmgr-hint" }, t("githubNoTokenHint")) : null
        ) : null,
        import_react2.default.createElement(
          "label",
          { className: "pmgr-check" },
          import_react2.default.createElement("input", { type: "checkbox", checked: autoRestart, onChange: onToggleAutoRestart }),
          import_react2.default.createElement("span", null, t("restartAfterInstall"))
        )
      ) : import_react2.default.createElement(
        "div",
        { className: "pmgr-install-form" },
        import_react2.default.createElement(
          "div",
          { className: "pmgr-install" },
          import_react2.default.createElement("input", {
            className: "pmgr-input",
            placeholder: t("searchGithubPlaceholder"),
            value: gq,
            onChange: (e) => setGq(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") doSearch();
            }
          }),
          import_react2.default.createElement("button", { className: "pmgr-btn", disabled: searching, onClick: doSearch }, searching ? t("searching") : t("searchBtn"))
        ),
        results && results.ok && Array.isArray(results.items) && results.items.length > 0 ? import_react2.default.createElement("div", { className: "pmgr-search-results" }, results.items.map(renderRepoItem)) : null,
        results && results.ok && results.items && results.items.length === 0 ? import_react2.default.createElement("div", { className: "pmgr-empty" }, t("noResults")) : null,
        results && !results.ok ? import_react2.default.createElement("div", { className: "pmgr-notice err" }, results.message) : null,
        results && results.noToken ? import_react2.default.createElement("div", { className: "pmgr-hint" }, t("githubNoTokenHint")) : null
      )
    )
  );
}
function PluginCard({ t, p, busy, onStop, onStart, onUninstall }) {
  const sourceLabel = p.source === "github" ? t("sourceGithub") : p.source === "npm" ? t("sourceNpm") : p.source === "local" ? t("sourceLocal") : "";
  const kindLabel = p.kind === "builtin" ? t("kindBuiltin") : t("kindThird");
  const tags = [];
  tags.push(import_react2.default.createElement("span", { key: "kind", className: "pmgr-tag " + (p.kind === "builtin" ? "pmgr-tag-builtin" : "pmgr-tag-third") }, kindLabel));
  if (sourceLabel) tags.push(import_react2.default.createElement("span", { key: "source", className: "pmgr-tag pmgr-tag-source" }, sourceLabel));
  const actions = [];
  if (p.kind === "third-party") {
    if (p.mounted && p.enabled) {
      actions.push(import_react2.default.createElement("button", { key: "stop", className: "pmgr-btn pmgr-btn-sm", disabled: busy !== null, onClick: onStop }, t("actionStop")));
    } else if (p.installed) {
      actions.push(import_react2.default.createElement("button", { key: "start", className: "pmgr-btn pmgr-btn-sm", disabled: busy !== null, onClick: onStart }, t("actionStart")));
    }
    actions.push(import_react2.default.createElement("button", { key: "uninstall", className: "pmgr-btn pmgr-btn-sm danger", disabled: busy !== null, onClick: onUninstall }, t("actionUninstall")));
  }
  const versionEl = p.version ? p.githubUrl ? import_react2.default.createElement(
    "a",
    { className: "pmgr-version", href: p.githubUrl, target: "_blank", rel: "noreferrer", title: t("openGithub") },
    p.version,
    import_react2.default.createElement("span", { className: "pmgr-version-arrow", "aria-hidden": "true" }, "\u2197")
  ) : import_react2.default.createElement("span", { className: "pmgr-version" }, p.version) : null;
  const busyThis = busy === p.name || busy === "install";
  return import_react2.default.createElement(
    "div",
    { className: "pmgr-card" },
    import_react2.default.createElement(
      "div",
      { className: "pmgr-card-top" },
      import_react2.default.createElement(
        "div",
        { className: "pmgr-card-name" },
        import_react2.default.createElement("span", { className: "pmgr-name", title: p.name }, p.name),
        versionEl
      ),
      import_react2.default.createElement(RuntimeState, { t, p })
    ),
    tags.length ? import_react2.default.createElement("div", { className: "pmgr-card-tags" }, tags) : null,
    import_react2.default.createElement(
      "div",
      { className: "pmgr-card-body" },
      import_react2.default.createElement(
        "div",
        { className: "pmgr-card-desc-wrap" },
        p.description ? import_react2.default.createElement("p", { className: "pmgr-card-desc", title: p.description }, p.description) : null
      ),
      actions.length ? import_react2.default.createElement("div", { className: "pmgr-card-actions" }, actions) : null
    ),
    busyThis ? import_react2.default.createElement("div", { className: "pmgr-foot" }, t("processing")) : null
  );
}

// src/client/ui.tsx
function PluginManagerTab(props) {
  const { t } = props;
  const [state, setState] = import_react3.default.useState({ loading: true, error: null, data: null });
  const [busy, setBusy] = import_react3.default.useState(null);
  const [modal, setModal] = import_react3.default.useState(null);
  const [confirm, setConfirm] = import_react3.default.useState(null);
  const [loading, setLoading] = import_react3.default.useState(null);
  const [statusFilter, setStatusFilter] = import_react3.default.useState("all");
  const [sourceFilter, setSourceFilter] = import_react3.default.useState("all");
  const [searchQuery, setSearchQuery] = import_react3.default.useState("");
  const [builtinOpen, setBuiltinOpen] = import_react3.default.useState(false);
  const [installOpen, setInstallOpen] = import_react3.default.useState(false);
  const [countdown, setCountdown] = import_react3.default.useState(null);
  const refresh = (silent) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    pmgr.list().then((data) => setState({ loading: false, error: null, data })).catch((e) => setState({ loading: false, error: String(e.message || e), data: null }));
  };
  import_react3.default.useEffect(() => {
    refresh(true);
  }, []);
  import_react3.default.useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      try {
        window.location.reload();
      } catch {
      }
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1e3);
    return () => clearTimeout(timer);
  }, [countdown]);
  const d = state.data;
  const plugins = d && d.plugins ? d.plugins : [];
  const autoRestart = !!(d && d.settings && d.settings.autoRestart);
  const act = (method, args, label, loadingText) => {
    setBusy(label);
    setModal(null);
    if (loadingText) setLoading({ label: loadingText });
    pmgr[method](args).then((data) => {
      const opName = t(method === "install" ? "opInstall" : method === "uninstall" ? "opUninstall" : method === "stop" ? "opStop" : method === "start" ? "opStart" : "opRestart");
      if (data && data.ok) {
        if (data.restarting) {
          setModal({ kind: "ok", op: method, title: opName + " " + t("success"), text: data.message || "", output: data.output || null });
          markRestartPending();
          setCountdown(10);
        } else {
          setModal({ kind: "ok", op: method, title: opName + " " + t("success"), text: data.message || t("ok"), output: data.output || null, pendingRestart: method === "install" || method === "uninstall" });
          refresh(true);
        }
      } else {
        setModal({ kind: "err", op: method, title: opName + " " + t("failed"), text: data && data.message || t("opFailed"), output: data && data.output || null });
      }
    }).catch((e) => setModal({ kind: "err", title: t("opFailed"), text: String(e.message || e), output: null })).finally(() => {
      setBusy(null);
      setLoading(null);
    });
  };
  const toggleAutoRestart = () => {
    setBusy("settings");
    pmgr.setSettings({ autoRestart: !autoRestart }).then((res) => {
      if (res && res.ok && res.settings) setState((prev) => ({ ...prev, data: { ...prev.data ?? {}, settings: res.settings } }));
    }).catch(() => {
    }).finally(() => setBusy(null));
  };
  const doRestartNow = () => {
    setModal(null);
    setBusy("restart");
    pmgr.restart().then((res) => {
      if (res && res.ok) {
        setModal({ kind: "ok", title: t("opRestart"), text: res.message || t("restarting"), output: null });
        markRestartPending();
        setCountdown(10);
      } else setModal({ kind: "err", title: t("opRestart") + " " + t("failed"), text: res && res.message || t("restartFailed"), output: null });
    }).catch((e) => setModal({ kind: "err", title: t("opRestart") + " " + t("failed"), text: String(e.message || e), output: null })).finally(() => setBusy(null));
  };
  const doReload = () => {
    try {
      window.location.reload();
    } catch {
      setModal(null);
    }
  };
  const confirmStop = (name) => setConfirm({ title: t("opStop"), message: t("confirmStop", { name }), onConfirm: () => act("stop", { name }, name) });
  const confirmUninstall = (name) => setConfirm({ title: t("opUninstall"), message: t("confirmUninstall", { name }), onConfirm: () => act("uninstall", { name }, name, t("uninstalling")) });
  const doStart = (name) => act("start", { name }, name);
  const doInstall = (spec) => {
    setInstallOpen(false);
    act("install", { spec }, "install", t("installing"));
  };
  const counts = {
    all: plugins.length,
    running: plugins.filter((p) => p.mounted && p.enabled && !p.missing).length,
    stopped: plugins.filter((p) => !p.enabled && !p.missing).length,
    error: plugins.filter((p) => p.missing).length
  };
  const filtered = plugins.filter((p) => {
    if (statusFilter === "running" && !(p.mounted && p.enabled && !p.missing)) return false;
    if (statusFilter === "stopped" && !(!p.enabled && !p.missing)) return false;
    if (statusFilter === "error" && !p.missing) return false;
    return true;
  }).filter((p) => {
    if (sourceFilter === "builtin" && p.kind !== "builtin") return false;
    if (sourceFilter === "third-party" && p.kind !== "third-party") return false;
    if (sourceFilter === "npm" && p.source !== "npm") return false;
    if (sourceFilter === "local" && p.source !== "local") return false;
    if (sourceFilter === "github" && p.source !== "github") return false;
    return true;
  }).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [p.name, p.description, p.source, p.spec, p.kind].some((v) => String(v || "").toLowerCase().includes(q));
  });
  const third = filtered.filter((p) => p.kind === "third-party");
  const builtin = filtered.filter((p) => p.kind === "builtin");
  const renderSection = (title, list, open, onToggle) => import_react3.default.createElement(
    "div",
    { className: "pmgr-group" },
    import_react3.default.createElement(
      "div",
      { className: "pmgr-group-head", onClick: onToggle },
      import_react3.default.createElement("h3", { className: "pmgr-group-title" }, title + " " + list.length),
      import_react3.default.createElement("span", { className: "pmgr-group-toggle" }, open ? t("collapse") : t("expand"))
    ),
    open ? list.length ? import_react3.default.createElement("div", { className: "pmgr-group" }, list.map((p) => import_react3.default.createElement(PluginCard, { key: p.name, t, p, busy, onStop: () => confirmStop(p.name), onStart: () => doStart(p.name), onUninstall: () => confirmUninstall(p.name) }))) : import_react3.default.createElement("div", { className: "pmgr-empty" }, t("noResults")) : null
  );
  return import_react3.default.createElement(
    "div",
    { className: "pmgr-root" },
    // 头部：标题 + profile + 刷新
    import_react3.default.createElement(
      "div",
      { className: "pmgr-head" },
      import_react3.default.createElement("h2", { className: "pmgr-title" }, t("tabLabel")),
      import_react3.default.createElement(
        "button",
        { className: "pmgr-btn", disabled: state.loading, onClick: () => refresh(false) },
        t("refresh")
      )
    ),
    d && d.profile ? import_react3.default.createElement("div", { className: "pmgr-profile", title: d.profileDir }, t("currentProfile") + "\uFF1A" + d.profile) : null,
    // 状态筛选 Tabs
    import_react3.default.createElement(StatusTabs, { t, counts, active: statusFilter, onChange: setStatusFilter }),
    // 工具栏
    import_react3.default.createElement(PluginToolbar, {
      t,
      search: searchQuery,
      onSearch: setSearchQuery,
      source: sourceFilter,
      onSource: setSourceFilter,
      onInstall: () => setInstallOpen(true)
    }),
    state.error ? import_react3.default.createElement("div", { className: "pmgr-notice err" }, String(state.error)) : null,
    state.loading && !state.data ? import_react3.default.createElement("div", { className: "pmgr-empty" }, t("loading")) : null,
    // 插件列表：三方优先，内置可折叠
    renderSection(t("groupThird"), third, true, () => {
    }),
    renderSection(t("groupBuiltin"), builtin, builtinOpen, () => setBuiltinOpen(!builtinOpen)),
    // 安装弹窗
    import_react3.default.createElement(InstallDialog, {
      t,
      open: installOpen,
      onClose: () => setInstallOpen(false),
      autoRestart,
      onToggleAutoRestart: toggleAutoRestart,
      busy,
      onInstall: doInstall
    }),
    // loading 弹窗
    loading ? import_react3.default.createElement(
      "div",
      { className: "pmgr-modal-backdrop" },
      import_react3.default.createElement(
        "div",
        { className: "pmgr-modal pmgr-modal-loading" },
        import_react3.default.createElement("span", { className: "pmgr-spinner" }),
        import_react3.default.createElement("p", { className: "pmgr-modal-text" }, loading.label)
      )
    ) : null,
    // 二次确认弹窗
    confirm ? import_react3.default.createElement(
      "div",
      { className: "pmgr-modal-backdrop", onClick: () => setConfirm(null) },
      import_react3.default.createElement(
        "div",
        { className: "pmgr-modal", onClick: (e) => e.stopPropagation() },
        import_react3.default.createElement(
          "div",
          { className: "pmgr-modal-head" },
          import_react3.default.createElement("h3", { className: "pmgr-modal-title" }, confirm.title),
          import_react3.default.createElement("button", { className: "pmgr-modal-close", onClick: () => setConfirm(null), "aria-label": "\xD7" }, "\xD7")
        ),
        import_react3.default.createElement(
          "div",
          { className: "pmgr-modal-body" },
          import_react3.default.createElement("p", { className: "pmgr-modal-text" }, confirm.message)
        ),
        import_react3.default.createElement(
          "div",
          { className: "pmgr-modal-actions" },
          import_react3.default.createElement("button", { className: "pmgr-btn pmgr-btn-sm danger", onClick: () => {
            setConfirm(null);
            confirm.onConfirm();
          } }, t("ok"))
        )
      )
    ) : null,
    // 结果弹窗
    modal ? import_react3.default.createElement(
      "div",
      { className: "pmgr-modal-backdrop", onClick: () => setModal(null) },
      import_react3.default.createElement(
        "div",
        { className: "pmgr-modal" + (modal.kind === "err" ? " err" : ""), onClick: (e) => e.stopPropagation() },
        import_react3.default.createElement(
          "div",
          { className: "pmgr-modal-head" },
          import_react3.default.createElement("h3", { className: "pmgr-modal-title" }, modal.title),
          import_react3.default.createElement("button", { className: "pmgr-modal-close", onClick: () => setModal(null), "aria-label": "\xD7" }, "\xD7")
        ),
        import_react3.default.createElement(
          "div",
          { className: "pmgr-modal-body" },
          import_react3.default.createElement("p", { className: "pmgr-modal-text" }, modal.text),
          countdown !== null ? import_react3.default.createElement("p", { className: "pmgr-countdown" }, t("autoRefreshIn", { n: countdown })) : null,
          modal.output ? import_react3.default.createElement("pre", { className: "pmgr-output" }, modal.output) : null
        ),
        import_react3.default.createElement(
          "div",
          { className: "pmgr-modal-actions" },
          modal.kind === "ok" && modal.op === "uninstall" ? import_react3.default.createElement("button", { className: "pmgr-btn pmgr-btn-sm", onClick: doReload }, t("refresh")) : null,
          modal.pendingRestart ? import_react3.default.createElement("button", { className: "pmgr-btn pmgr-btn-sm", onClick: doRestartNow, disabled: busy !== null }, t("restartNow")) : null,
          import_react3.default.createElement("button", { className: "pmgr-btn pmgr-btn-sm", onClick: () => setModal(null) }, t("ok"))
        )
      )
    ) : null
  );
}

// src/client/i18n.ts
var zh = {
  // 页面头部
  tabLabel: "\u63D2\u4EF6\u7BA1\u7406",
  currentProfile: "\u5F53\u524D Profile",
  refresh: "\u5237\u65B0",
  // 状态筛选 Tab
  statusAll: "\u5168\u90E8",
  statusRunning: "\u8FD0\u884C\u4E2D",
  statusStopped: "\u5DF2\u505C\u7528",
  statusError: "\u5F02\u5E38",
  // Toolbar
  searchInstalled: "\u641C\u7D22\u5DF2\u5B89\u88C5\u63D2\u4EF6\u2026",
  sourceAll: "\u5168\u90E8\u6765\u6E90",
  sourceBuiltin: "\u5185\u7F6E",
  sourceThird: "\u7B2C\u4E09\u65B9",
  sourceNpm: "npm",
  sourceLocal: "\u672C\u5730",
  sourceGithub: "GitHub",
  installPlugin: "\u5B89\u88C5\u63D2\u4EF6",
  // 分组
  groupThird: "\u7B2C\u4E09\u65B9\u63D2\u4EF6",
  groupBuiltin: "\u5185\u7F6E\u63D2\u4EF6",
  collapse: "\u25BE \u6536\u8D77",
  expand: "\u25B8 \u5C55\u5F00",
  // 插件卡片
  stateRunning: "\u8FD0\u884C\u4E2D",
  stateStopped: "\u5DF2\u505C\u7528",
  stateFailed: "\u52A0\u8F7D\u5931\u8D25",
  kindBuiltin: "\u5185\u7F6E",
  kindThird: "\u7B2C\u4E09\u65B9",
  actionStop: "\u505C\u7528",
  actionStart: "\u542F\u7528",
  actionUninstall: "\u5378\u8F7D",
  openGithub: "\u6253\u5F00 GitHub",
  uninstallTitle: "\u5378\u8F7D\u63D2\u4EF6",
  // 安装弹窗
  installTitle: "\u5B89\u88C5\u63D2\u4EF6",
  installDirect: "\u76F4\u63A5\u5B89\u88C5",
  installGithub: "\u641C\u7D22 GitHub",
  specLabel: "\u63D2\u4EF6\u5730\u5740\u6216\u5305\u540D",
  specPlaceholder: "@scope/package / github:owner/repo / pnpm spec",
  restartAfterInstall: "\u5B89\u88C5\u540E\u81EA\u52A8\u91CD\u542F",
  cancel: "\u53D6\u6D88",
  install: "\u5B89\u88C5",
  installing: "\u5B89\u88C5\u4E2D\u2026",
  searchGithubPlaceholder: "\u641C\u7D22 GitHub \u63D2\u4EF6\u2026",
  searchBtn: "\u641C\u7D22",
  searching: "\u641C\u7D22\u4E2D\u2026",
  noResults: "\u65E0\u7ED3\u679C",
  resolving: "\u68C0\u6D4B\u4E2D\u2026",
  resolveGithubHint: "\u672A\u5728 npm \u627E\u5230 {name}\uFF0C\u68C0\u6D4B\u5230\u4EE5\u4E0B GitHub \u63D2\u4EF6\uFF1A",
  resolveNotFound: "\u672A\u627E\u5230\u63D2\u4EF6 {name}\uFF08\u65E2\u975E npm \u5305\uFF0C\u4E5F\u975E GitHub \u4ED3\u5E93\uFF09",
  githubNoTokenHint: "\u672A\u914D\u7F6E GitHub token\uFF1A\u641C\u7D22\u53D7\u9650\uFF08\u7EA6 10 \u6B21/\u5206\u949F\uFF09\u3002\u53EF\u5168\u5C40\u8BBE\u7F6E GH_TOKEN \u73AF\u5883\u53D8\u91CF\u63D0\u9AD8\u9650\u989D\u3002",
  // 操作结果 / 弹窗
  opInstall: "\u5B89\u88C5",
  opUninstall: "\u5378\u8F7D",
  opStop: "\u505C\u7528",
  opStart: "\u542F\u7528",
  opRestart: "\u91CD\u542F",
  success: "\u6210\u529F",
  failed: "\u5931\u8D25",
  opFailed: "\u64CD\u4F5C\u5931\u8D25",
  ok: "\u786E\u5B9A",
  restartNow: "\u7ACB\u5373\u91CD\u542F",
  restarting: "\u6B63\u5728\u91CD\u542F dsh web\u2026",
  autoRefreshIn: "{n} \u79D2\u540E\u81EA\u52A8\u5237\u65B0\u9875\u9762\u2026",
  restartToast: "\u5DF2\u81EA\u52A8\u91CD\u542F\u5B8C\u6210\uFF0C\u524D\u5F80\u300C\u8BBE\u7F6E \u2192 \u63D2\u4EF6 \u2192 \u63D2\u4EF6\u7BA1\u7406\u300D\u67E5\u770B\u3002",
  goView: "\u53BB\u67E5\u770B",
  restartFailed: "\u65E0\u6CD5\u89E6\u53D1\u91CD\u542F",
  uninstalling: "\u6B63\u5728\u5378\u8F7D\u2026",
  confirmUninstall: "\u786E\u5B9A\u5378\u8F7D\u63D2\u4EF6 {name} \u5417\uFF1F\uFF08\u91CD\u542F\u540E\u4E0D\u518D\u88C5\u8F7D\uFF09",
  confirmStop: "\u786E\u5B9A\u505C\u7528\u63D2\u4EF6 {name} \u5417\uFF1F\uFF08\u91CD\u542F\u540E\u751F\u6548\uFF09",
  // 其他
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  processing: "\u5904\u7406\u4E2D\u2026"
};
var en = {
  tabLabel: "Plugin Manager",
  currentProfile: "Current Profile",
  refresh: "Refresh",
  statusAll: "All",
  statusRunning: "Running",
  statusStopped: "Stopped",
  statusError: "Error",
  searchInstalled: "Search installed plugins\u2026",
  sourceAll: "All sources",
  sourceBuiltin: "Built-in",
  sourceThird: "Third-party",
  sourceNpm: "npm",
  sourceLocal: "Local",
  sourceGithub: "GitHub",
  installPlugin: "Install plugin",
  groupThird: "Third-party plugins",
  groupBuiltin: "Built-in plugins",
  collapse: "\u25BE Collapse",
  expand: "\u25B8 Expand",
  stateRunning: "Running",
  stateStopped: "Stopped",
  stateFailed: "Failed to load",
  kindBuiltin: "Built-in",
  kindThird: "Third-party",
  actionStop: "Stop",
  actionStart: "Start",
  actionUninstall: "Uninstall",
  openGithub: "Open GitHub",
  uninstallTitle: "Uninstall plugin",
  installTitle: "Install plugin",
  installDirect: "Direct install",
  installGithub: "Search GitHub",
  specLabel: "Package spec",
  specPlaceholder: "@scope/package / github:owner/repo / pnpm spec",
  restartAfterInstall: "Auto-restart after install",
  cancel: "Cancel",
  install: "Install",
  installing: "Installing\u2026",
  searchGithubPlaceholder: "Search GitHub plugins\u2026",
  searchBtn: "Search",
  searching: "Searching\u2026",
  noResults: "No results",
  resolving: "Resolving\u2026",
  resolveGithubHint: "{name} is not on npm; found these GitHub plugins:",
  resolveNotFound: "Plugin {name} not found (neither an npm package nor a GitHub repo)",
  githubNoTokenHint: "No GitHub token configured; search is rate-limited (~10/min). Set GH_TOKEN globally to raise the limit.",
  opInstall: "Install",
  opUninstall: "Uninstall",
  opStop: "Stop",
  opStart: "Start",
  opRestart: "Restart",
  success: "succeeded",
  failed: "failed",
  opFailed: "Operation failed",
  ok: "OK",
  restartNow: "Restart now",
  restarting: "Restarting dsh web\u2026",
  autoRefreshIn: "Auto-refreshing page in {n}s\u2026",
  restartToast: "Auto-restart complete. Open Settings \u2192 Plugins \u2192 Plugin Manager to view plugins.",
  goView: "View",
  restartFailed: "Unable to trigger restart",
  uninstalling: "Uninstalling\u2026",
  confirmUninstall: "Uninstall plugin {name}? (it will no longer load after restart)",
  confirmStop: "Stop plugin {name}? (takes effect after restart)",
  loading: "Loading\u2026",
  processing: "Working\u2026"
};

// src/client/index.ts
var NS = "settings.pluginManager";
var inject = ["slots", "locale"];
function apply(ctx) {
  injectStyles();
  ctx.effect(
    () => ctx.locale.register(NS, { zh, en }),
    "dsh-plugin-manager: dictionaries"
  );
  const t = ctx.locale.bind(NS);
  const slots = ctx.get("slots");
  if (slots === void 0) return;
  slots.inject(
    "settings.plugins.tab",
    () => slots.register(
      {
        name: "settings.plugins.tab",
        id: "pm-manage",
        order: 20,
        label: () => t("tabLabel")
      },
      () => import_react4.default.createElement(PluginManagerTab, { t })
    )
  );
  slots.inject(
    "shell.overlay",
    () => slots.register(
      {
        name: "shell.overlay",
        id: "pmgr-restart-toast",
        order: 100,
        label: "dsh-plugin-manager"
      },
      () => import_react4.default.createElement(RestartToast, { t })
    )
  );
}

    return module.exports;
  },
});

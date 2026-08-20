// 样式：插件管理页（紧凑后台风格，低视觉噪声）
const CSS = `
.pmgr-root { display: flex; flex-direction: column; gap: 12px; padding: 4px 2px 24px; }

/* 头部 */
.pmgr-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pmgr-title { font-size: 16px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
.pmgr-profile { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }

/* 状态筛选 Tabs */
.pmgr-tabs { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; border-bottom: 1px solid var(--dsw-alias-border-l1); padding-bottom: 2px; }
.pmgr-tab { border: none; background: none; padding: 6px 10px; font-size: 13px; color: var(--dsw-alias-label-secondary); cursor: pointer; border-radius: 6px 6px 0 0; border-bottom: 2px solid transparent; }
.pmgr-tab:hover { color: var(--dsw-alias-label-primary); }
.pmgr-tab.active { color: var(--dsw-alias-label-primary); font-weight: 600; border-bottom-color: var(--dsw-alias-brand-primary); }

/* 工具栏 */
.pmgr-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pmgr-toolbar-search { flex: 1; min-width: 160px; }
.pmgr-select { height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 8px; font-size: 12px; cursor: pointer; }

/* 输入与按钮 */
.pmgr-input { flex: 1; min-width: 0; height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; }
.pmgr-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.pmgr-btn { height: 30px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease; }
.pmgr-btn:hover:not(:disabled) { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.pmgr-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.pmgr-btn:disabled { opacity: 0.55; cursor: default; }
.pmgr-btn-sm { height: 26px; padding: 0 10px; font-size: 12px; border-radius: 6px; }
.pmgr-btn-primary { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: #fff; }
.pmgr-btn-primary:hover:not(:disabled) { color: #fff; filter: brightness(1.05); }
.pmgr-btn.danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.pmgr-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent); }

/* 分组 */
.pmgr-group { display: flex; flex-direction: column; gap: 8px; }
.pmgr-group-head { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; user-select: none; }
.pmgr-group-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
.pmgr-group-toggle { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }

/* 插件卡片 */
.pmgr-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.15s ease; }
.pmgr-card:hover { border-color: var(--dsw-alias-border-l2); }
.pmgr-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
.pmgr-card-name { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.pmgr-name { font-size: 15px; font-weight: 600; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; padding:3px 0; }
.pmgr-version { font-size: 12px; font-weight: 400; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); text-decoration: underline; flex: none; }
.pmgr-version:hover { color: var(--dsw-alias-brand-primary); }
.pmgr-version-arrow { font-size: 11px; margin-left: 1px; opacity: 0.85; }
.pmgr-state { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; white-space: nowrap; flex: none; }
.pmgr-state-running { color: var(--dsw-alias-state-success-primary); }
.pmgr-state-stopped { color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
.pmgr-state-error { color: var(--dsw-alias-state-error-primary); font-weight: 600; }
.pmgr-card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pmgr-tag { display: inline-flex; align-items: center; font-size: 11px; line-height: 1; padding: 6px 10px; border-radius: 16px; border: 1px solid var(--dsw-alias-border-l4); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
.pmgr-tag-third { border-color: var(--dsw-alias-border-l4); color: var(--dsw-alias-brand-primary); }
.pmgr-card-body { display: flex; align-items: flex-start; gap: 12px; }
.pmgr-card-desc-wrap { flex: 1; min-width: 0; }
.pmgr-card-desc { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pmgr-card-actions { flex: none; display: flex; align-items: center; gap: 6px; }

/* 弹窗 */
@keyframes pmgr-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pmgr-pop-in { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
@keyframes pmgr-spin { to { transform: rotate(360deg) } }
.pmgr-spinner { width: 16px; height: 16px; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); border-radius: 50%; animation: pmgr-spin 0.8s linear infinite; flex: none; }
.pmgr-modal-loading { flex-direction: row; align-items: center; gap: 10px; padding: 18px 20px; }
.pmgr-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: pmgr-fade-in 0.15s ease; }
.pmgr-modal { width: min(480px, calc(100vw - 48px)); max-height: 80vh; overflow: auto; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.2); animation: pmgr-pop-in 0.18s ease; }
.pmgr-modal.err { border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2)); }
.pmgr-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pmgr-modal-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.pmgr-modal-close { border: none; background: none; font-size: 18px; line-height: 1; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); cursor: pointer; padding: 2px 6px; border-radius: 6px; }
.pmgr-modal-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.pmgr-modal-body { display: flex; flex-direction: column; gap: 8px; }
.pmgr-modal-text { margin: 0; font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-primary); white-space: pre-wrap; word-break: break-word; }
.pmgr-countdown { margin: 0; font-size: 12px; font-weight: 600; color: var(--dsw-alias-brand-primary); }
.pmgr-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* 安装弹窗 */
.pmgr-install-dialog { width: min(520px, calc(100vw - 48px)); min-height:190px; }
.pmgr-install-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.pmgr-install-tab { border: none; background: none; padding: 6px 12px; font-size: 13px; color: var(--dsw-alias-label-secondary); cursor: pointer; border-bottom: 2px solid transparent; }
.pmgr-install-tab.active { color: var(--dsw-alias-label-primary); font-weight: 600; border-bottom-color: var(--dsw-alias-brand-primary); }
.pmgr-install-form { display: flex; flex-direction: column; gap: 10px; }
.pmgr-field-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.pmgr-check { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.pmgr-install { display: flex; gap: 8px; align-items: center; }

/* 搜索结果 */
.pmgr-search-results { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow: auto; }
.pmgr-resolve { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow: auto; }
.pmgr-search-item { display: flex; align-items: center; gap: 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 10px 12px; }
.pmgr-search-item:hover { border-color: var(--dsw-alias-border-l2); }
.pmgr-search-item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pmgr-search-item-name { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pmgr-search-item-name:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
.pmgr-search-item-stars { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
.pmgr-search-item-desc { font-size: 12px; color: var(--dsw-alias-label-secondary); margin: 2px 0 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 提示 */
.pmgr-notice { font-size: 12px; border-radius: 8px; padding: 8px 10px; line-height: 1.5; }
.pmgr-notice.ok { color: var(--dsw-alias-state-success-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.pmgr-notice.err { color: var(--dsw-alias-state-error-primary); background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1); }
.pmgr-hint { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); line-height: 1.5; }
.pmgr-empty { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); padding: 12px 0; }
.pmgr-output { font-size: 11px; font-family: ui-monospace, monospace; white-space: pre-wrap; word-break: break-all; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2); border-radius: 6px; padding: 8px; max-height: 180px; overflow: auto; margin: 0; }
.pmgr-foot { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); line-height: 1.6; margin: 0; }

/* 重启完成 toast */
.pmgr-toast { position: fixed; top: 16px; right: 16px; z-index: 3000; display: flex; align-items: center; gap: 10px; max-width: 360px; padding: 10px 14px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); box-shadow: 0 8px 24px rgba(0,0,0,0.16); font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-primary); pointer-events: auto; animation: pmgr-pop-in 0.18s ease; }
.pmgr-toast-text { flex: 1; min-width: 0; }
.pmgr-toast-action { flex: none; height: 26px; padding: 0 10px; border: 1px solid var(--dsw-alias-brand-primary); background: var(--dsw-alias-brand-primary); color: #fff; border-radius: 6px; font-size: 12px; cursor: pointer; }
.pmgr-toast-action:hover { filter: brightness(1.05); }
.pmgr-toast-close { border: none; background: none; font-size: 16px; line-height: 1; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); cursor: pointer; padding: 2px 6px; border-radius: 6px; flex: none; }
.pmgr-toast-close:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }

/* 响应式 */
@media (max-width: 640px) {
  .pmgr-toolbar { flex-direction: column; align-items: stretch; }
  .pmgr-toolbar-search { flex: none; }
}
`;
const STYLE_ID = 'dsh-plugin-manager/pmgr.css';

export function injectStyles() {
  if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
    const tag = document.createElement('style');
    tag.dataset.plugin = 'dsh-plugin-manager';
    tag.dataset.pluginCss = STYLE_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }
}

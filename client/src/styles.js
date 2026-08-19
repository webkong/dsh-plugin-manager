// 样式：注入 <style> 到 document.head（与静态 client bundle 约定一致）
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
.pmgr-group-head { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; user-select: none; }
.pmgr-group-head:hover .pmgr-group-title { color: var(--dsw-alias-label-primary); }
.pmgr-group-toggle { font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
/* 搜索框与安装输入框（.pmgr-input）样式一致；组内为纵向 flex，禁掉 flex:1 防止纵向拉伸，宽度靠 cross-axis stretch 撑满 */
.pmgr-search { flex: none; }
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

export function injectStyles() {
  if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
    const tag = document.createElement('style');
    tag.dataset.plugin = 'dsh-plugin-manager';
    tag.dataset.pluginCss = STYLE_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }
}

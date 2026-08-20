// 样式：注入 <style> 到 document.head（与静态 client bundle 约定一致）
// 卡片采用「插件管理后台」信息架构：Header（标题+状态+操作）/ 描述 / 来源 metadata
const CSS = `
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

/* 弹窗 */
@keyframes pmgr-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes pmgr-pop-in { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
@keyframes pmgr-spin { to { transform: rotate(360deg) } }
.pmgr-spinner { width: 16px; height: 16px; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); border-radius: 50%; animation: pmgr-spin 0.8s linear infinite; flex: none; }
.pmgr-modal-loading { flex-direction: row; align-items: center; gap: 10px; padding: 18px 20px; }
.pmgr-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: pmgr-fade-in 0.15s ease; }
.pmgr-modal { width: min(480px, calc(100vw - 48px)); max-height: 75vh; overflow: auto; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.2); animation: pmgr-pop-in 0.18s ease; }
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
/* 搜索框与安装输入框（.pmgr-input）样式一致；组内为纵向 flex，禁掉 flex:1 防止纵向拉伸 */
.pmgr-search { flex: none; }
.pmgr-group-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
.pmgr-section-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); margin: 0; }
.pmgr-sub { display: flex; flex-direction: column; gap: 8px; }
.pmgr-sub-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); margin: 2px 0 0; }
.pmgr-sub-title::after { content: ''; flex: 1; height: 1px; background: var(--dsw-alias-border-l1); }

/* ---------- 卡片 ---------- */
.pmgr-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s ease; }
.pmgr-card:hover { border-color: var(--dsw-alias-border-l2); }

/* 第一层：Header = 信息区（左） + 操作区（右） */
.pmgr-card-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.pmgr-card-info { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.pmgr-card-title-row { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.pmgr-name { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.pmgr-ver { font-size: 12px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); flex: none; }
.pmgr-card-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

/* 轻量 Badge：默认中性灰；已启用浅绿底深绿字；停用/失效弱化 */
.pmgr-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; font-size: 11px; line-height: 1; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); white-space: nowrap; }
.pmgr-badge.kind-third { color: var(--dsw-alias-brand-primary); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, var(--dsw-alias-border-l2)); }
.pmgr-badge.enabled { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, var(--dsw-alias-bg-layer-1)); }
.pmgr-badge.stopped { color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }
.pmgr-badge.missing { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, var(--dsw-alias-bg-layer-1)); }

/* Runtime 状态：绿色小圆点 + 弱文字 */
.pmgr-runtime { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 6px; font-size: 11px; color: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); white-space: nowrap; }
.pmgr-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-success-primary); flex: none; }
.pmgr-dot.off { background: var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary)); }

/* 操作区：停用/启动 secondary；卸载弱化文字按钮；GitHub 轻量链接 */
.pmgr-card-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.pmgr-btn { height: 28px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 6px; padding: 0 12px; font-size: 12px; cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease; }
.pmgr-btn:hover:not(:disabled) { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.pmgr-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.pmgr-btn:disabled { opacity: 0.55; cursor: default; }
.pmgr-btn-sm { height: 26px; padding: 0 10px; font-size: 12px; border-radius: 6px; }
.pmgr-btn-sm.weak { height: 26px; padding: 0 10px; }
.pmgr-btn.danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); }
.pmgr-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent); }
.pmgr-btn.weak { border: none; background: none; padding: 0 8px; color: var(--dsw-alias-label-secondary); }
.pmgr-btn.weak:hover:not(:disabled) { color: var(--dsw-alias-state-error-primary); }
.pmgr-btn.weak:focus-visible { outline: 2px solid var(--dsw-alias-state-error-primary); outline-offset: 1px; }
.pmgr-btn.link { border: none; background: none; padding: 0 6px; color: var(--dsw-alias-brand-primary); text-decoration: none; }
.pmgr-btn.link:hover { text-decoration: underline; }

/* 第二层：描述（最多两行，超出 line-clamp；无描述时不渲染） */
.pmgr-card-desc { font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-secondary); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 第三层：来源 metadata footer */
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

/* 响应式：中等宽度操作区换行成组；窄屏 actions 移到底部整行 */
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

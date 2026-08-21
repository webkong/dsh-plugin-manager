// 样式注入：幂等插入一个带 data-plugin-css 标签的 <style>（对齐 dsh-plugin-manager 原实现）
import css from './styles.css'

const STYLE_ID = 'dsh-plugin-manager/pmgr.css'

export function injectStyles(): void {
  if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-plugin-manager'
    tag.dataset.pluginCss = STYLE_ID
    tag.textContent = css
    document.head.appendChild(tag)
  }
}

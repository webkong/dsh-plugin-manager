// 插件管理页子组件：状态 Tabs / Toolbar / 安装弹窗 / 插件卡片（含 ••• 菜单）
import React from 'react'
import { pmgr } from './api.ts'
import { validateSpec, isBareName } from './spec.ts'
import type { Translate } from './i18n.ts'
import type { PluginView, GitHubRepo, ResolveResult } from './types.ts'

/** 卡片运行时状态：●运行中 / 已停用 / ●加载失败 */
export function RuntimeState({ t, p }: { t: Translate; p: PluginView }): React.ReactElement {
  if (p.missing) {
    return React.createElement('span', { className: 'pmgr-state pmgr-state-error' }, '● ' + t('stateFailed'))
  }
  if (p.enabled) {
    return React.createElement('span', { className: 'pmgr-state pmgr-state-running' }, '● ' + t('stateRunning'))
  }
  return React.createElement('span', { className: 'pmgr-state pmgr-state-stopped' }, t('stateStopped'))
}

interface TabCounts {
  all: number
  running: number
  stopped: number
  error: number
}

// 状态筛选 Tabs
export function StatusTabs({ t, counts, active, onChange }: {
  t: Translate
  counts: TabCounts
  active: string
  onChange: (key: string) => void
}): React.ReactElement {
  const tabs: Array<[string, string, number]> = [
    ['all', t('statusAll'), counts.all],
    ['running', t('statusRunning'), counts.running],
    ['stopped', t('statusStopped'), counts.stopped],
    ['error', t('statusError'), counts.error],
  ]
  return React.createElement(
    'div',
    { className: 'pmgr-tabs' },
    tabs.map(([key, label, count]) =>
      React.createElement(
        'button',
        { key, className: 'pmgr-tab' + (active === key ? ' active' : ''), onClick: () => onChange(key) },
        label + ' ' + count,
      ),
    ),
  )
}

// 工具栏：搜索 + 来源筛选 + 安装插件
export function PluginToolbar({ t, search, onSearch, source, onSource, onInstall }: {
  t: Translate
  search: string
  onSearch: (v: string) => void
  source: string
  onSource: (v: string) => void
  onInstall: () => void
}): React.ReactElement {
  const sources: Array<[string, string]> = [
    ['all', t('sourceAll')],
    ['builtin', t('sourceBuiltin')],
    ['third-party', t('sourceThird')],
    ['npm', t('sourceNpm')],
    ['local', t('sourceLocal')],
    ['github', t('sourceGithub')],
  ]
  return React.createElement(
    'div',
    { className: 'pmgr-toolbar' },
    React.createElement('input', {
      className: 'pmgr-input pmgr-toolbar-search',
      placeholder: t('searchInstalled'),
      value: search,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value),
    }),
    React.createElement(
      'select',
      { className: 'pmgr-select', value: source, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onSource(e.target.value) },
      sources.map(([k, l]) => React.createElement('option', { key: k, value: k }, l)),
    ),
    React.createElement('button', { className: 'pmgr-btn pmgr-btn-primary', onClick: onInstall }, '+ ' + t('installPlugin')),
  )
}

interface InstallDialogProps {
  t: Translate
  open: boolean
  onClose: () => void
  autoRestart: boolean
  onToggleAutoRestart: () => void
  busy: string | null
  onInstall: (spec: string) => void
}

// 安装弹窗：直接安装 / 搜索 GitHub
export function InstallDialog({ t, open, onClose, autoRestart, onToggleAutoRestart, busy, onInstall }: InstallDialogProps): React.ReactElement | null {
  const [mode, setMode] = React.useState<'direct' | 'github'>('direct')
  const [spec, setSpec] = React.useState('')
  const [err, setErr] = React.useState('')
  const [gq, setGq] = React.useState('')
  const [results, setResults] = React.useState<{ ok: boolean; message?: string; items?: GitHubRepo[]; noToken?: boolean } | null>(null)
  const [searching, setSearching] = React.useState(false)
  const [resolving, setResolving] = React.useState(false)
  const [resolved, setResolved] = React.useState<ResolveResult | null>(null)

  if (!open) return null

  const doInstall = (): void => {
    const check = validateSpec(spec)
    if (!check.ok) {
      setErr(check.error)
      return
    }
    setErr('')
    const clean = spec.trim()
    if (isBareName(clean)) {
      resolveBare(clean)
    } else {
      onInstall(clean)
    }
  }

  // 裸包名：探测是 npm 还是 GitHub
  const resolveBare = (name: string): void => {
    setResolving(true)
    setResolved(null)
    pmgr.resolve({ name })
      .then((d: ResolveResult) => {
        if (!d || !d.ok) {
          setErr((d && d.message) || t('opFailed'))
          return
        }
        if (d.type === 'npm') {
          onInstall(name)
          return
        }
        if (d.type === 'github') {
          setResolved(d)
          return
        }
        setErr(t('resolveNotFound', { name }))
      })
      .catch((e: unknown) => setErr(String((e as Error).message || e)))
      .finally(() => setResolving(false))
  }

  const doSearch = (): void => {
    setSearching(true)
    pmgr.search({ q: gq })
      .then((d) => setResults(d))
      .catch((e: unknown) => setResults({ ok: false, message: String((e as Error).message || e), items: [] }))
      .finally(() => setSearching(false))
  }

  const renderRepoItem = (r: GitHubRepo): React.ReactElement =>
    React.createElement(
      'div',
      { key: r.fullName, className: 'pmgr-search-item' },
      React.createElement(
        'div',
        { className: 'pmgr-search-item-info' },
        React.createElement('a', { className: 'pmgr-search-item-name', href: r.htmlUrl, target: '_blank', rel: 'noreferrer', title: r.fullName }, r.fullName),
        React.createElement('span', { className: 'pmgr-search-item-stars' }, '⭐ ' + r.stars),
        r.description ? React.createElement('p', { className: 'pmgr-search-item-desc' }, r.description) : null,
      ),
      React.createElement(
        'button',
        { className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: () => onInstall('github:' + r.fullName + '#' + r.defaultBranch) },
        t('install'),
      ),
    )

  return React.createElement(
    'div',
    { className: 'pmgr-modal-backdrop', onClick: onClose },
    React.createElement(
      'div',
      { className: 'pmgr-modal pmgr-install-dialog', onClick: (e: React.MouseEvent) => e.stopPropagation() },
      React.createElement(
        'div',
        { className: 'pmgr-modal-head' },
        React.createElement('h3', { className: 'pmgr-modal-title' }, t('installTitle')),
        React.createElement('button', { className: 'pmgr-modal-close', onClick: onClose, 'aria-label': '×' }, '×'),
      ),
      React.createElement(
        'div',
        { className: 'pmgr-install-tabs' },
        React.createElement('button', { className: 'pmgr-install-tab' + (mode === 'direct' ? ' active' : ''), onClick: () => setMode('direct') }, t('installDirect')),
        React.createElement('button', { className: 'pmgr-install-tab' + (mode === 'github' ? ' active' : ''), onClick: () => setMode('github') }, t('installGithub')),
      ),
      mode === 'direct'
        ? React.createElement(
            'div',
            { className: 'pmgr-install-form' },
            React.createElement(
              'div',
              { className: 'pmgr-install' },
              React.createElement('input', {
                className: 'pmgr-input',
                placeholder: t('specPlaceholder'),
                value: spec,
                autoFocus: true,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setSpec(e.target.value); setResolved(null); setErr('') },
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') doInstall()
                },
              }),
              React.createElement('button', { className: 'pmgr-btn pmgr-btn-primary', disabled: busy !== null || resolving, onClick: doInstall },
                resolving ? t('resolving') : busy === 'install' ? t('installing') : t('install')),
            ),
            err ? React.createElement('div', { className: 'pmgr-notice err' }, err) : null,
            resolved && resolved.type === 'github'
              ? React.createElement(
                  'div',
                  { className: 'pmgr-resolve' },
                  React.createElement('div', { className: 'pmgr-notice' }, t('resolveGithubHint', { name: spec.trim() })),
                  (resolved.candidates || []).map(renderRepoItem),
                  resolved.noToken ? React.createElement('div', { className: 'pmgr-hint' }, t('githubNoTokenHint')) : null,
                )
              : null,
            React.createElement(
              'label',
              { className: 'pmgr-check' },
              React.createElement('input', { type: 'checkbox', checked: autoRestart, onChange: onToggleAutoRestart }),
              React.createElement('span', null, t('restartAfterInstall')),
            ),
          )
        : React.createElement(
            'div',
            { className: 'pmgr-install-form' },
            React.createElement(
              'div',
              { className: 'pmgr-install' },
              React.createElement('input', {
                className: 'pmgr-input',
                placeholder: t('searchGithubPlaceholder'),
                value: gq,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGq(e.target.value),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') doSearch()
                },
              }),
              React.createElement('button', { className: 'pmgr-btn', disabled: searching, onClick: doSearch }, searching ? t('searching') : t('searchBtn')),
            ),
            results && results.ok && Array.isArray(results.items) && results.items.length > 0
              ? React.createElement('div', { className: 'pmgr-search-results' }, results.items.map(renderRepoItem))
              : null,
            results && results.ok && results.items && results.items.length === 0
              ? React.createElement('div', { className: 'pmgr-empty' }, t('noResults'))
              : null,
            results && !results.ok
              ? React.createElement('div', { className: 'pmgr-notice err' }, results.message)
              : null,
            results && results.noToken
              ? React.createElement('div', { className: 'pmgr-hint' }, t('githubNoTokenHint'))
              : null,
          ),
    ),
  )
}

interface PluginCardProps {
  t: Translate
  p: PluginView
  busy: string | null
  onStop: () => void
  onStart: () => void
  onUninstall: () => void
}

// 插件卡片：名称+版本(GitHub入口) / 状态；描述与操作（停用+卸载纵向）同一行
export function PluginCard({ t, p, busy, onStop, onStart, onUninstall }: PluginCardProps): React.ReactElement {
  const sourceLabel = p.source === 'github' ? t('sourceGithub') : p.source === 'npm' ? t('sourceNpm') : p.source === 'local' ? t('sourceLocal') : ''
  const kindLabel = p.kind === 'builtin' ? t('kindBuiltin') : t('kindThird')
  // meta 信息做成 tag 标签（第三方/内置在前，来源在后）
  const tags: React.ReactElement[] = []
  tags.push(React.createElement('span', { key: 'kind', className: 'pmgr-tag ' + (p.kind === 'builtin' ? 'pmgr-tag-builtin' : 'pmgr-tag-third') }, kindLabel))
  if (sourceLabel) tags.push(React.createElement('span', { key: 'source', className: 'pmgr-tag pmgr-tag-source' }, sourceLabel))
  // dsh ≥ 0.1.2：预设组合装载的插件不在 Loader 根行里，单独标出以免被误读为「未装载」
  const presets = p.presets ?? []
  if (presets.length) {
    tags.push(React.createElement(
      'span',
      { key: 'presets', className: 'pmgr-tag pmgr-tag-preset', title: presets.join(', ') },
      t('mountedByPreset', { list: presets.join(', ') }),
    ))
  }

  // 操作列：主操作（停用/启用）在上，卸载在下，纵向排列。
  // 「启用」覆盖两种内部情形：已装载但被停用（移除 disabled 标记）、
  // 已安装但未装载（bundle→加 bundles；非 bundle→写 patch insert 条目）。
  const actions: React.ReactElement[] = []
  if (p.kind === 'third-party') {
    if (p.mounted && p.enabled) {
      actions.push(React.createElement('button', { key: 'stop', className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: onStop }, t('actionStop')))
    } else if (p.installed) {
      actions.push(React.createElement('button', { key: 'start', className: 'pmgr-btn pmgr-btn-sm', disabled: busy !== null, onClick: onStart }, t('actionStart')))
    }
    actions.push(React.createElement('button', { key: 'uninstall', className: 'pmgr-btn pmgr-btn-sm danger', disabled: busy !== null, onClick: onUninstall }, t('actionUninstall')))
  }

  // 版本号跟在包名后，作为跳转 GitHub 的入口（下划线 + 右侧箭头）
  const versionEl: React.ReactElement | null = p.version
    ? p.githubUrl
      ? React.createElement('a', { className: 'pmgr-version', href: p.githubUrl, target: '_blank', rel: 'noreferrer', title: t('openGithub') },
          p.version,
          React.createElement('span', { className: 'pmgr-version-arrow', 'aria-hidden': 'true' }, '↗'))
      : React.createElement('span', { className: 'pmgr-version' }, p.version)
    : null

  const busyThis = busy === p.name || busy === 'install'

  return React.createElement(
    'div',
    { className: 'pmgr-card' },
    React.createElement(
      'div',
      { className: 'pmgr-card-top' },
      React.createElement(
        'div',
        { className: 'pmgr-card-name' },
        React.createElement('span', { className: 'pmgr-name', title: p.name }, p.name),
        versionEl,
      ),
      React.createElement(RuntimeState, { t, p }),
    ),
    tags.length ? React.createElement('div', { className: 'pmgr-card-tags' }, tags) : null,
    React.createElement(
      'div',
      { className: 'pmgr-card-body' },
      React.createElement(
        'div',
        { className: 'pmgr-card-desc-wrap' },
        p.description ? React.createElement('p', { className: 'pmgr-card-desc', title: p.description }, p.description) : null,
      ),
      actions.length ? React.createElement('div', { className: 'pmgr-card-actions' }, actions) : null,
    ),
    busyThis ? React.createElement('div', { className: 'pmgr-foot' }, t('processing')) : null,
  )
}

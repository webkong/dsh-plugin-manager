// 插件多语言文案（zh / en）
export const zh = {
  title: 'DSH 插件管理器',
  tabLabel: '插件管理',
  refresh: '刷新',
  autoRestart: '自动重启',

  builtinLabel: '内置',
  thirdLabel: '三方',
  enabledStat: '已启用',
  stoppedStat: '已停用',
  missingStat: '失效',

  installPlaceholder: '安装：插件名 / github:owner/repo#main / 任意 pnpm 包标识',
  install: '安装',
  installTitle: '安装',
  installing: '安装中…',

  groupThird: '三方插件',
  groupBuiltin: '内置插件',
  collapse: '▾ 收起',
  expand: '▸ 展开',
  searchPlaceholder: '搜索{title}…（模糊匹配）',
  noMatch: '无匹配',

  subRunning: '运行中',
  subStopped: '已停用',
  subMissing: '失效',

  kindBuiltin: '内置',
  kindThird: '第三方',
  sourceGithub: 'GitHub',
  sourceNpm: 'npm',
  sourceLocal: '本地路径',
  sourceLabel: '来源',
  fullCommit: '完整 commit',

  running: '运行中',
  notRunning: '未运行',
  phaseLoading: '加载中',
  phaseFailed: '失败',
  phasePending: '等待中',
  phaseUnloading: '卸载中',

  actionStop: '停用',
  actionStart: '启动',
  actionLoad: '装载',
  actionUninstall: '卸载',
  confirmUninstall: '确定卸载插件 {name} 吗？（重启后不再装载）',
  confirmStop: '确定停用插件 {name} 吗？（重启后生效）',
  cancel: '取消',
  uninstalling: '正在卸载…',

  processing: '处理中…',
  loading: '加载中…',

  opInstall: '安装',
  opUninstall: '卸载',
  opStop: '停用',
  opStart: '启动',
  opRestart: '重启',
  success: '成功',
  failed: '失败',
  opFailed: '操作失败',
  ok: '确定',
  restartNow: '立即重启',
  restarting: '正在重启 dsh web…',
  restartFailed: '无法触发重启',

  footNote:
    '说明：安装 / 卸载通过 pnpm（dsh plugin）执行，重启后生效；停用 / 启动通过修改 profile 的 cordis.patch.yml（重启后生效，若当前进程 HMR 已激活则可能即时生效）。内置插件属于 DSH 发行版，只读。' +
    ' 三方插件的 GitHub 链接取自依赖声明或已安装包的 repository 字段。',
};

export const en = {
  title: 'DSH Plugin Manager',
  tabLabel: 'Plugin Manager',
  refresh: 'Refresh',
  autoRestart: 'Auto-restart',

  builtinLabel: 'Built-in',
  thirdLabel: '3rd-party',
  enabledStat: 'Enabled',
  stoppedStat: 'Stopped',
  missingStat: 'Missing',

  installPlaceholder: 'Install: package name / github:owner/repo#main / any pnpm spec',
  install: 'Install',
  installTitle: 'Install',
  installing: 'Installing…',

  groupThird: 'Third-party plugins',
  groupBuiltin: 'Built-in plugins',
  collapse: '▾ Collapse',
  expand: '▸ Expand',
  searchPlaceholder: 'Search {title}… (fuzzy)',
  noMatch: 'No match',

  subRunning: 'Running',
  subStopped: 'Stopped',
  subMissing: 'Missing',

  kindBuiltin: 'Built-in',
  kindThird: 'Third-party',
  sourceGithub: 'GitHub',
  sourceNpm: 'npm',
  sourceLocal: 'Local path',
  sourceLabel: 'Source',
  fullCommit: 'full commit',

  running: 'Running',
  notRunning: 'Not running',
  phaseLoading: 'Loading',
  phaseFailed: 'Failed',
  phasePending: 'Pending',
  phaseUnloading: 'Unloading',

  actionStop: 'Stop',
  actionStart: 'Start',
  actionLoad: 'Load',
  actionUninstall: 'Uninstall',
  confirmUninstall: 'Uninstall plugin {name}? (it will no longer load after restart)',
  confirmStop: 'Stop plugin {name}? (takes effect after restart)',
  cancel: 'Cancel',
  uninstalling: 'Uninstalling…',

  processing: 'Working…',
  loading: 'Loading…',

  opInstall: 'Install',
  opUninstall: 'Uninstall',
  opStop: 'Stop',
  opStart: 'Start',
  opRestart: 'Restart',
  success: 'succeeded',
  failed: 'failed',
  opFailed: 'Operation failed',
  ok: 'OK',
  restartNow: 'Restart now',
  restarting: 'Restarting dsh web…',
  restartFailed: 'Unable to trigger restart',

  footNote:
    'Note: install/uninstall run via pnpm (dsh plugin) and take effect after restart; stop/start edit the profile cordis.patch.yml (effective after restart, or immediately when HMR is active). Built-in plugins are shipped with DSH and are read-only.' +
    ' GitHub links for third-party plugins come from the dependency spec or the installed package repository field.',
};

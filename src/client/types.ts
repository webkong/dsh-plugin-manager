// 插件管理共享类型：Host /pmgr 数据面（wire 形状）与 UI 状态

/** 插件清单行（Host list() 返回） */
export interface PluginView {
  name: string
  version: string | null
  description: string | null
  kind: 'builtin' | 'third-party'
  source: string
  spec: string | null
  installed: boolean
  installDir: string | null
  inBundles: boolean
  isBundle: boolean
  mounted: boolean
  disabled: boolean
  disabledByManager: boolean
  enabled: boolean
  missing: boolean
  runtime: { enabled: boolean; fiberPhase: string | null } | null
  entryIds: string[]
  githubUrl: string | null
  homepage: string | null
}

/** 清单响应 */
export interface ListResult {
  ok: boolean
  message?: string
  profile: string
  profileDir: string
  dshHome: string
  settings: { autoRestart: boolean }
  counts: { total: number; builtin: number; thirdParty: number; disabled: number }
  plugins: PluginView[]
}

/** GitHub 搜索结果行 */
export interface GitHubRepo {
  fullName: string
  name: string
  description: string
  htmlUrl: string
  stars: number
  owner: string
  defaultBranch: string
}

/** 裸包名解析结果 */
export interface ResolveResult {
  ok: boolean
  message?: string
  input: string
  type: 'npm' | 'github' | 'none'
  spec: string | null
  candidates: GitHubRepo[]
  noToken?: boolean
  rateLimited?: boolean
}

/** 操作结果弹窗 */
export interface ModalState {
  kind: 'ok' | 'err'
  op?: string
  title: string
  text: string
  output?: string | null
  pendingRestart?: boolean
}

/** 二次确认弹窗 */
export interface ConfirmState {
  title: string
  message: string
  onConfirm: () => void
}

/** 操作 loading 状态 */
export interface LoadingState {
  label: string
}

// CSS 文本模块声明（esbuild text loader）
declare module '*.css' {
  const css: string
  export default css
}

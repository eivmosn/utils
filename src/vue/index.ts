/**
 * Vue 适配入口：`@eivmosn/utils/vue`
 *
 * 单独分包是为了让纯函数入口(`@eivmosn/utils`)不依赖 vue。
 * 所有依赖 vue 的 composable 都从这里导出。
 */
export * from './useSearch'

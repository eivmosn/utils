import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/vue/index.ts'],
  format: {
    esm: {
      target: ['es2015'],
    },
  },
  exports: true,
  target: 'es2015',
  clean: true,
  dts: true,
  // 不用 typesVersions：它会把 ./vue 子路径错误映射到主入口类型文件
  typesVersions: false,
  // vue 是可选 peer：纯函数入口不能把 vue runtime 打进产物
  deps: {
    neverBundle: ['vue'],
  },
})

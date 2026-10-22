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
  deps: {
    neverBundle: ['vue'],
  },
})

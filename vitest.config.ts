import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // .verify 是临时验证目录，不参与本包测试
    exclude: ['node_modules/**', 'dist/**', '.verify/**'],
  },
})

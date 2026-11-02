import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    env: { DEBUG: 'true' },
    setupFiles: ['src/i18n/i18n.ts'],
    // Typed ESLint suites each load a TypeScript project into their worker.
    maxWorkers: 4,
  },
})

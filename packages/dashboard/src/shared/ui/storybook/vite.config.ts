import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Deliberately independent of the dashboard's local CSV and API middleware.
export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: false,
  resolve: { alias: { '@': resolve(import.meta.dirname, '../../..') } },
})

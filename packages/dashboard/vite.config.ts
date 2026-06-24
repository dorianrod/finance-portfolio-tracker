import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Mirrors the Python pipeline's data-dir resolution (FINANCE_DATA_DIR env
// var, falling back to the monorepo's shared data/ folder) so `npm run dev`
// keeps reading live CSVs without baking personal data into dist/.
function resolveOutputDir(): string {
  const base = process.env.FINANCE_DATA_DIR
    ? resolve(process.env.FINANCE_DATA_DIR)
    : resolve(__dirname, '../../data')
  return resolve(base, 'output')
}

function serveFinanceData(): Plugin {
  const outputDir = resolveOutputDir()

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const requestPath = decodeURIComponent((req.url ?? '').split('?')[0])
    const filePath = resolve(outputDir, '.' + requestPath)
    if (
      (filePath !== outputDir && !filePath.startsWith(outputDir + sep)) ||
      !existsSync(filePath) ||
      !statSync(filePath).isFile()
    ) {
      next()
      return
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.end(readFileSync(filePath))
  }

  return {
    name: 'serve-finance-data',
    configureServer(server) {
      server.middlewares.use('/data', middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data', middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveFinanceData()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

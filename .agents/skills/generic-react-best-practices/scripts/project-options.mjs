import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

export function isMain(url) {
  return (
    process.argv[1] &&
    realpathSync(resolve(process.argv[1])) === fileURLToPath(url)
  )
}

export function projectOptions(args = process.argv.slice(2)) {
  const { values } = parseArgs({
    args,
    options: {
      root: { type: 'string', default: process.cwd() },
      source: { type: 'string', default: 'src' },
      project: { type: 'string', default: 'tsconfig.app.json' },
      catalog: { type: 'string' },
    },
  })
  const root = resolve(values.root)
  return {
    root,
    source: resolve(root, values.source),
    project: resolve(root, values.project),
    catalog: values.catalog ? resolve(root, values.catalog) : undefined,
  }
}

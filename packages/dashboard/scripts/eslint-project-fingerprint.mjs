import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// ESLint's file cache does not track imported types, shared consumers or catalogs.
// A project-wide config key invalidates every result when any lint input changes.
export function eslintProjectFingerprint(directory) {
  const hash = createHash('sha256')
  const sourceDirectories = new Set(['src', 'eslint-rules', 'scripts'])

  function visit(relativeDirectory = '') {
    const entries = readdirSync(join(directory, relativeDirectory), {
      withFileTypes: true,
    }).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const path = join(relativeDirectory, entry.name)
      if (entry.isDirectory()) {
        if (relativeDirectory || sourceDirectories.has(entry.name)) {
          hash.update(`directory:${path}\0`)
          visit(path)
        }
      } else if (
        relativeDirectory ||
        /\.(?:[cm]?[jt]sx?|json)$/u.test(entry.name)
      ) {
        const contents = readFileSync(join(directory, path))
        hash.update(`file:${path}\0${contents.length}\0`)
        hash.update(contents)
      }
    }
  }

  visit()
  return hash.digest('hex')
}

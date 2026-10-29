import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

// ESLint's file cache does not track imported types, shared consumers or catalogs.
// A project-wide config key invalidates every result when any lint input changes.
export function eslintProjectFingerprint(
  directory,
  {
    toolingDirectory = resolve(import.meta.dirname, '..'),
    extraFiles = [],
  } = {},
) {
  const hash = createHash('sha256')
  const sourceDirectories = new Set(['src', 'tests', 'eslint-rules', 'scripts'])

  function visit(root, relativeDirectory = '') {
    const entries = readdirSync(join(root, relativeDirectory), {
      withFileTypes: true,
    }).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const path = join(relativeDirectory, entry.name)
      if (entry.isDirectory()) {
        if (relativeDirectory || sourceDirectories.has(entry.name)) {
          hash.update(`directory:${path}\0`)
          visit(root, path)
        }
      } else if (
        relativeDirectory ||
        /\.(?:[cm]?[jt]sx?|json)$/u.test(entry.name)
      ) {
        const contents = readFileSync(join(root, path))
        hash.update(`file:${path}\0${contents.length}\0`)
        hash.update(contents)
      }
    }
  }

  hash.update('project\0')
  visit(directory)
  hash.update('tooling\0')
  visit(toolingDirectory)
  for (const path of extraFiles) {
    hash.update(`extra:${path}\0`)
    hash.update(readFileSync(path))
  }
  return hash.digest('hex')
}

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectTranslationKeys } from './collect-translation-keys.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const sourceRoot = join(root, 'src')
const catalog = JSON.parse(
  readFileSync(join(sourceRoot, 'i18n', 'locales', 'en.json'), 'utf8'),
)
const usedKeys = new Set()

function visitSourceFile(path) {
  for (const key of collectTranslationKeys(readFileSync(path, 'utf8'), path))
    usedKeys.add(key)
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (/\.tsx?$/.test(path)) visitSourceFile(path)
  }
}

walk(sourceRoot)

const unusedKeys = Object.keys(catalog).filter((key) => {
  const pluralBase = key.replace(/_(?:one|other)$/, '')
  return !usedKeys.has(key) && !usedKeys.has(pluralBase)
})

if (unusedKeys.length > 0) {
  console.error(`Unused i18n catalog keys:\n${unusedKeys.join('\n')}`)
  process.exitCode = 1
}

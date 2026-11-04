#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { collectTranslationKeys } from './collect-translation-keys.mjs'
import { isMain, projectOptions } from './project-options.mjs'

export function unusedTranslationKeys(sourceRoot, catalogFile) {
  const catalog = JSON.parse(readFileSync(catalogFile, 'utf8'))
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

  return Object.keys(catalog).filter((key) => {
    const pluralBase = key.replace(/_(?:one|other)$/, '')
    return !usedKeys.has(key) && !usedKeys.has(pluralBase)
  })
}

if (isMain(import.meta.url)) {
  const { source, catalog } = projectOptions()
  if (!catalog) throw new Error('Provide --catalog <reference-catalog.json>.')
  const unusedKeys = unusedTranslationKeys(source, catalog)
  if (unusedKeys.length > 0) {
    console.error(`Unused i18n catalog keys:\n${unusedKeys.join('\n')}`)
    process.exitCode = 1
  }
}

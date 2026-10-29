import { spawnSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, expect, it } from 'vitest'

const directories = []

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

function project() {
  const root = mkdtempSync(join(tmpdir(), 'react-skill-cli-'))
  directories.push(root)
  mkdirSync(join(root, 'src'))
  return root
}

function run(script, root, args) {
  const executable = join(root, 'tool.mjs')
  symlinkSync(resolve(import.meta.dirname, script), executable)
  return spawnSync(process.execPath, [executable, '--root', root, ...args], {
    encoding: 'utf8',
  })
}

it('checks an unrelated project and reports cycles when invoked through a bin symlink', () => {
  const root = project()
  writeFileSync(
    join(root, 'browser.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'Bundler',
        paths: { '@/*': ['./src/*'] },
      },
      include: ['src'],
    }),
  )
  writeFileSync(
    join(root, 'src/first.ts'),
    "import {second} from '@/second'; export const first = second",
  )
  writeFileSync(
    join(root, 'src/second.ts'),
    "import {first} from '@/first'; export const second = first",
  )
  const result = run('import-cycles.mjs', root, ['--project', 'browser.json'])
  expect(result.error).toBeUndefined()
  expect(result.status, result.stderr).toBe(1)
  expect(result.stderr).toContain(
    'Runtime import cycle: src/first.ts → src/second.ts → src/first.ts',
  )
})

it('checks the supplied catalog rather than a catalog relative to the installed skill', () => {
  const root = project()
  mkdirSync(join(root, 'translations'))
  writeFileSync(
    join(root, 'src/labels.ts'),
    "import {t} from 'i18next'; export const label = () => t('invoice.amount')",
  )
  writeFileSync(
    join(root, 'translations/reference.json'),
    JSON.stringify({ 'invoice.amount': 'Amount', unused: 'Unused' }),
  )
  const result = run('check-i18n-catalog.mjs', root, [
    '--catalog',
    'translations/reference.json',
  ])
  expect(result.error).toBeUndefined()
  expect(result.status, result.stderr).toBe(1)
  expect(result.stderr.trim()).toBe('Unused i18n catalog keys:\nunused')
})

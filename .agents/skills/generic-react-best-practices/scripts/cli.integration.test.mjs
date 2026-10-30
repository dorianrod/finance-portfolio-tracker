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

it('checks new-owner test presence through the packaged CLI', () => {
  const root = project()
  const baseline = run('check-test-colocation.mjs', root, ['--snapshot'])
  expect(baseline.status, baseline.stderr).toBe(0)
  const file = join(root, 'baseline.json')
  writeFileSync(file, baseline.stdout)
  writeFileSync(
    join(root, 'src/Panel.view.tsx'),
    'export function Panel() {return <div/>}',
  )
  const missing = run('check-test-colocation.mjs', root, ['--baseline', file])
  expect(missing.status, missing.stderr).toBe(1)
  expect(JSON.parse(missing.stdout).missing).toBe(1)
  writeFileSync(join(root, 'src/Panel.view.test.tsx'), '')
  expect(
    run('check-test-colocation.mjs', root, ['--baseline', file]).status,
  ).toBe(0)
})

it('fails unavailable colocation input and calculates metrics through the CLI', () => {
  const root = project()
  expect(run('check-test-colocation.mjs', root, []).status).toBe(2)
  const file = join(root, 'metrics.json')
  writeFileSync(
    file,
    JSON.stringify({
      schemaVersion: 1,
      scope: 'orders/full',
      unreviewedExceptions: 0,
      rules: [{ id: 'example', impact: 'HIGH', coverage: 'complete' }],
      findings: [],
    }),
  )
  const result = spawnSync(
    process.execPath,
    [resolve(import.meta.dirname, 'audit-metrics.mjs'), '--input', file],
    { encoding: 'utf8' },
  )
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout).score).toBe(100)
})

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
  rmSync(executable, { force: true })
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

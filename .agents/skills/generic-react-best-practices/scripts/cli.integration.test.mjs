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

function run(script, root, args, cwd = process.cwd()) {
  const executable = join(root, 'tool.mjs')
  rmSync(executable, { force: true })
  symlinkSync(resolve(import.meta.dirname, script), executable)
  return spawnSync(process.execPath, [executable, '--root', root, ...args], {
    encoding: 'utf8',
    cwd,
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

it('collects small composed fixture candidates through the packaged bin symlink', () => {
  const root = project()
  // Scalar-only samples do not need DOM libraries in each CLI subprocess.
  const compilerOptions = { lib: ['es2020'], types: [] }
  mkdirSync(join(root, 'src/domains/shipping/types'), { recursive: true })
  writeFileSync(
    join(root, 'src/domains/shipping/types/parcel.type.ts'),
    'export type Parcel = {weight:number} & {tracking:string}',
  )
  mkdirSync(join(root, 'src/domains/shipping/mocks'), { recursive: true })
  writeFileSync(
    join(root, 'src/domains/shipping/mocks/parcel.mock.ts'),
    'import type {Parcel} from "../types/parcel.type"; export function makeParcel(overrides:Partial<Parcel>={}):Parcel {return {weight:20,tracking:"parcel-1",...overrides}}',
  )
  writeFileSync(
    join(root, 'src/parcel.test.ts'),
    'const sample = {weight:20,tracking:"parcel-1"}',
  )
  writeFileSync(
    join(root, 'tsconfig.app.json'),
    JSON.stringify({
      compilerOptions: { ...compilerOptions, strict: true },
      include: ['src'],
    }),
  )
  const result = run('fixture-candidates.mjs', root, [])
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout).candidates).toMatchObject([
    {
      file: 'src/parcel.test.ts',
      contracts: [{ name: 'Parcel' }],
      verdict: 'requires-semantic-review',
    },
  ])
  expect(
    run('fixture-candidates.mjs', root, ['--project', 'missing.json']).status,
  ).toBe(2)

  const inventory = JSON.parse(result.stdout)
  const review = {
    schemaVersion: 1,
    source: inventory.source,
    project: inventory.project,
    analysis: inventory.analysis,
    reviews: inventory.candidates.map(({ file, line, column }) => ({
      file,
      line,
      column,
      sha256: inventory.testFiles.find((row) => row.file === file).sha256,
      decision: 'keep',
      reason:
        'Explicit isolated review supplied to test binding and freshness only.',
    })),
  }
  writeFileSync(join(root, 'reviews.json'), JSON.stringify(review))
  const accepted = run('fixture-candidates.mjs', root, [
    '--review',
    'reviews.json',
  ])
  expect(accepted.status, accepted.stderr).toBe(0)
  expect(JSON.parse(accepted.stdout)).toMatchObject({
    status: 'reviewed',
    reviewed: 1,
  })

  writeFileSync(
    join(root, 'src/new.test.ts'),
    'const added = {weight:30,tracking:"parcel-2"}',
  )
  const added = run('fixture-candidates.mjs', root, [
    '--review',
    'reviews.json',
  ])
  expect(added.status, added.stderr).toBe(1)
  expect(JSON.parse(added.stdout).pending).toMatchObject([
    { file: 'src/new.test.ts' },
  ])

  writeFileSync(
    join(root, 'src/new.test.ts'),
    'import {makeParcel} from "./domains/shipping/mocks/parcel.mock"; makeParcel({weight:30})',
  )
  const owned = run('fixture-candidates.mjs', root, [
    '--review',
    'reviews.json',
  ])
  expect(owned.status, owned.stderr).toBe(1)
  expect(JSON.parse(owned.stdout)).toMatchObject({
    pending: [],
    stale: [{ reason: 'Analysis inputs changed; review the inventory again.' }],
  })
  // Synthetic review metadata for the valid neighbor, after inspecting its
  // changed input above. Real application ledgers require semantic review.
  review.analysis = JSON.parse(
    run('fixture-candidates.mjs', root, []).stdout,
  ).analysis
  writeFileSync(join(root, 'reviews.json'), JSON.stringify(review))
  expect(
    run('fixture-candidates.mjs', root, ['--review', 'reviews.json']).status,
  ).toBe(0)

  writeFileSync(
    join(root, 'src/new.test.ts'),
    'export const changedConsumer = true',
  )
  const changedTest = run('fixture-candidates.mjs', root, [
    '--review',
    'reviews.json',
  ])
  expect(changedTest.status, changedTest.stderr).toBe(1)
  expect(JSON.parse(changedTest.stdout).stale).toMatchObject([
    { reason: 'Analysis inputs changed; review the inventory again.' },
  ])

  writeFileSync(join(root, 'reviews.json'), '{')
  expect(
    run('fixture-candidates.mjs', root, ['--review', 'reviews.json']).status,
  ).toBe(2)

  writeFileSync(
    join(root, 'tsconfig.app.json'),
    JSON.stringify({
      compilerOptions,
      include: ['src'],
      exclude: ['**/*.test.ts'],
    }),
  )
  const omitted = run('fixture-candidates.mjs', root, [])
  expect(omitted.status).toBe(2)
  expect(omitted.stderr).toContain('Tests missing from the TypeScript project')

  writeFileSync(
    join(root, 'tsconfig.app.json'),
    JSON.stringify({ compilerOptions, include: ['src'] }),
  )
  writeFileSync(
    join(root, 'src/new.test.ts'),
    'import {build} from "./missing"; build()',
  )
  const unresolved = run('fixture-candidates.mjs', root, [])
  expect(unresolved.status).toBe(2)
  expect(unresolved.stderr).toContain(
    'Cannot inspect invalid TypeScript project',
  )
  expect(unresolved.stdout).toBe('')
}, 30000)

it('rejects omitted canonical inputs and leaves wrapped business inputs pending through the CLI', () => {
  const root = project()
  mkdirSync(join(root, 'src/domains/delivery/types'), { recursive: true })
  const contract = 'src/domains/delivery/types/consignment.type.ts'
  writeFileSync(join(root, contract), 'export type Consignment = {mass:number}')
  writeFileSync(
    join(root, 'src/consignment.test.ts'),
    'const sample = {mass:12}',
  )
  const config = { include: ['src'], exclude: ['**/*.type.ts'] }
  writeFileSync(join(root, 'tsconfig.app.json'), JSON.stringify(config))
  const omitted = run('fixture-candidates.mjs', root, [])
  expect(omitted.status, omitted.stderr).toBe(2)
  expect(omitted.stderr).toContain(
    'Canonical contracts missing from the TypeScript project: ' + contract,
  )
  expect(omitted.stdout).toBe('')

  delete config.exclude
  writeFileSync(join(root, 'tsconfig.app.json'), JSON.stringify(config))
  const complete = run('fixture-candidates.mjs', root, [])
  expect(complete.status, complete.stderr).toBe(0)
  const inventory = JSON.parse(complete.stdout)
  expect(inventory.candidates).toHaveLength(1)

  mkdirSync(join(root, 'node_modules/vitest'), { recursive: true })
  writeFileSync(
    join(root, 'node_modules/vitest/index.d.ts'),
    'export declare const it:{each<T>(rows:T[]):(name:string,run:()=>void)=>void}',
  )
  const putTest = (value) =>
    writeFileSync(
      join(root, 'src/consignment.test.ts'),
      'import {it} from "vitest"; declare function consume(value:{mass:number}):number; it.each([' +
        value +
        '])("case",()=>{})',
    )
  putTest('{mass:12}')
  const direct = run('fixture-candidates.mjs', root, [])
  expect(direct.status, direct.stderr).toBe(0)
  const directInventory = JSON.parse(direct.stdout)
  expect(directInventory.candidates).toEqual([])
  expect(directInventory.excluded).toMatchObject([
    { reason: 'parametrized scenario row' },
  ])
  writeFileSync(
    join(root, 'reviews.json'),
    JSON.stringify({
      schemaVersion: 1,
      source: directInventory.source,
      project: directInventory.project,
      analysis: directInventory.analysis,
      reviews: [],
    }),
  )
  expect(
    run('fixture-candidates.mjs', root, ['--review', 'reviews.json']).status,
  ).toBe(0)
  putTest('consume({mass:12})')
  const wrapped = run('fixture-candidates.mjs', root, [
    '--review',
    'reviews.json',
  ])
  expect(wrapped.status, wrapped.stderr).toBe(1)
  expect(JSON.parse(wrapped.stdout).pending).toMatchObject([
    { file: 'src/consignment.test.ts' },
  ])
}, 30000)

it('resolves configured type libraries from the selected project with an unrelated invoking directory', () => {
  const root = project()
  const outside = project()
  mkdirSync(join(root, 'node_modules/@types/scenario-environment'), {
    recursive: true,
  })
  writeFileSync(
    join(root, 'node_modules/@types/scenario-environment/index.d.ts'),
    'declare const SCENARIO_READY:boolean',
  )
  mkdirSync(join(root, 'src/domains/delivery/types'), { recursive: true })
  writeFileSync(
    join(root, 'src/domains/delivery/types/readiness.type.ts'),
    'export type Readiness = {ready:boolean}',
  )
  writeFileSync(
    join(root, 'src/readiness.test.ts'),
    'const sample = {ready:SCENARIO_READY}',
  )
  mkdirSync(join(root, 'config'))
  writeFileSync(
    join(root, 'config/browser.json'),
    JSON.stringify({
      compilerOptions: { types: ['scenario-environment'] },
      include: ['../src'],
    }),
  )
  const result = run(
    'fixture-candidates.mjs',
    root,
    ['--project', 'config/browser.json'],
    outside,
  )
  expect(result.status, result.stderr).toBe(0)
  expect(JSON.parse(result.stdout).candidates).toMatchObject([
    { file: 'src/readiness.test.ts', contracts: [{ name: 'Readiness' }] },
  ])
})

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { findImportCycles } from './import-cycles.mjs'

const roots = []
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'import-cycles-'))
  roots.push(root)
  mkdirSync(join(root, 'src'))
  writeFileSync(
    join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'Bundler',
        paths: { '@/*': ['./src/*'] },
      },
      include: ['src'],
    }),
  )
  for (const [name, source] of Object.entries(files))
    writeFileSync(join(root, 'src', name), source)
  return join(root, 'tsconfig.json')
}

describe('production import cycles', () => {
  it.each([
    {
      name: 'aliased import',
      edge: "import {second} from '@/second'; export const first = second",
    },
    {
      name: 'named reexport',
      edge: "export {second as first} from './second'",
    },
    { name: 'namespace reexport', edge: "export * as first from './second'" },
  ])('rejects a cycle through a $name', ({ edge }) => {
    expect(
      findImportCycles(
        project({
          'first.ts': edge,
          'second.ts':
            "import {first} from './first'; export const second = first",
        }),
      ),
    ).toEqual([['src/first.ts', 'src/second.ts', 'src/first.ts']])
  })

  it.each([
    {
      name: 'type import',
      edge: "import type {Second} from './second'; export type First = Second",
    },
    {
      name: 'inline type export',
      edge: "export {type Second as First} from './second'",
    },
    {
      name: 'deferred import',
      edge: "export const first = () => import('./second')",
    },
  ])('preserves an erased or deferred $name', ({ edge }) => {
    expect(
      findImportCycles(
        project({
          'first.ts': edge,
          'second.ts': "import './first'; export type Second = string",
        }),
      ),
    ).toEqual([])
  })

  it('does not mistake a diamond dependency for a cycle', () => {
    expect(
      findImportCycles(
        project({
          'first.ts': "import './second'; import './third'",
          'second.ts': "import './fourth'",
          'third.ts': "import './fourth'",
          'fourth.ts': 'export const value = 1',
        }),
      ),
    ).toEqual([])
  })

  it('keeps test-only dependencies outside production cycles', () => {
    expect(
      findImportCycles(
        project({
          'first.ts': 'export const value = 1',
          'first.test.ts': "import './second.test'",
          'second.test.ts': "import './first.test'",
        }),
      ),
    ).toEqual([])
  })

  it('rejects unreadable or invalid project configuration', () => {
    expect(() => findImportCycles('/missing/tsconfig.json')).toThrow()
    const config = project({ 'first.ts': 'export {}' })
    writeFileSync(
      config,
      JSON.stringify({ compilerOptions: { module: 'invalid' } }),
    )
    expect(() => findImportCycles(config)).toThrow()
  })

  it('keeps the actual application production graph free of runtime cycles', () => {
    expect(
      findImportCycles(resolve(import.meta.dirname, '..', 'tsconfig.app.json')),
    ).toEqual([])
  })
})

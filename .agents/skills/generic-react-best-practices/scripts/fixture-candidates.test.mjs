import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { findFixtureCandidates } from './fixture-candidates.mjs'

const directories = []
afterEach(() => {
  directories
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true }))
})

describe('complete fixture candidate inventory', () => {
  it.each([
    [
      'annotated intersection',
      'const sample: Reading = { label: "North", value: 20, rank: 2 }',
      'Reading',
    ],
    [
      'inferred intersection',
      'const sample = { label: "North", value: 20, rank: 2 }',
      'Reading',
    ],
    ['single field', 'const sample: Flag = { active: true }', 'Flag'],
    [
      'optional record',
      'const sample: Preferences = {minimum:2}',
      'Preferences',
    ],
    [
      'two fields',
      'const sample = { label: "North", value: 20 }',
      'Measurement',
    ],
    [
      'generated rows',
      'const rows: Reading[] = Array.from({length:2}, (_, rank) => ({label:"North", value:20, rank}))',
      'Reading',
    ],
    [
      'inferred factory',
      'const sample = () => ({label:"North", value:20, rank:2})',
      'Reading',
    ],
    [
      'imported alias',
      'type Local = Reading; const sample: Local = {label:"North", value:20, rank:2}',
      'Reading',
    ],
    [
      'union variant',
      'const sample: Activity = {kind:"started", value:20}',
      'Activity',
    ],
    ['mapped type', 'const sample: Selection = {label:"North"}', 'Selection'],
    [
      'interface',
      'const sample: Location = {latitude:10, longitude:20}',
      'Location',
    ],
    ['computed static key', 'const sample = {["active"]:true}', 'Flag'],
    [
      'composed input',
      'declare function consume(value: Measurement & Flag):void; consume({label:"North",value:20,active:true})',
      'Measurement',
    ],
  ])(
    'includes %s without a field-count or plain-object restriction',
    (_, code, name) => {
      const root = project(code)
      const result = findFixtureCandidates(root)
      expect(
        result.candidates.flatMap((row) =>
          row.contracts.map((contract) => contract.name),
        ),
      ).toContain(name)
      expect(result.candidates.map((row) => row.verdict)).toEqual([
        'requires-semantic-review',
      ])
      expect(result.testFiles).toMatchObject([
        {
          file: 'src/sample.test.ts',
          sha256: expect.stringMatching(/^[a-f0-9]{64}$/u),
        },
      ])
    },
  )

  it.each([
    [
      'Partial override',
      'declare function change(value: Partial<Reading>):void; change({label:"North",value:20,rank:2})',
      'explicit Partial override',
    ],
    [
      'owning factory',
      'import {makeReading} from "./domains/rentals/mocks/reading.mock"; makeReading({label:"North",value:20,rank:2})',
      'owning mock consumer',
    ],
    [
      'expected value',
      'import {expect} from "vitest"; expect({}).toEqual({label:"North",value:20,rank:2})',
      'expected assertion value',
    ],
    [
      'named expected value',
      'import {expect} from "vitest"; const expected:Reading={label:"North",value:20,rank:2}; expect({}).toEqual(expected)',
      'named expected assertion value',
    ],
    [
      'aliased expectation',
      'import {expect as check} from "vitest"; check({active:true})',
      'expected assertion value',
    ],
    [
      'immutable expectation alias',
      'import {expect} from "vitest"; const check = expect; check({active:true})',
      'expected assertion value',
    ],
    [
      'existing state update',
      'declare const previous:Reading; const changed={...previous,label:"North",value:20,rank:2}',
      'existing sample/state composition; partial spreads require manual review',
    ],
    [
      'case table',
      'import {it} from "vitest"; it.each([{label:"North",value:20,rank:2}])("case",()=>{})',
      'parametrized scenario row',
    ],
    [
      'raw validation input',
      'import {schema} from "yup"; schema.validateSync({label:"North",value:20,rank:2})',
      'raw validation input',
    ],
  ])('distinguishes %s from unresolved sample defaults', (_, code, reason) => {
    const result = findFixtureCandidates(project(code))
    expect(result.candidates).toEqual([])
    expect(result.excluded.map((row) => row.reason)).toEqual([reason])
  })

  it('retains raw transport and action arguments as review candidates rather than proven errors', () => {
    const result = findFixtureCandidates(
      project('declare function send(value:unknown):void; send({active:true})'),
    )
    expect(result.candidates).toMatchObject([
      { verdict: 'requires-semantic-review', context: 'CallExpression' },
    ])
    expect(result.limit).toContain('Candidates are not violations')
  })

  it('respects an unrelated shadowed assertion name', () => {
    const result = findFixtureCandidates(
      project(
        'function expect(value:unknown){return value}; expect({active:true})',
      ),
    )
    expect(result.candidates).toHaveLength(1)
    expect(result.excluded).toEqual([])
  })

  it('does not mistake a local type named Partial for the built-in override utility', () => {
    const result = findFixtureCandidates(
      project(
        'type Partial<T> = {label:string;value:number;rank:number}; declare function consume(value:Partial<Reading>):void; consume({label:"North",value:20,rank:2})',
      ),
    )
    expect(result.candidates).toHaveLength(1)
    expect(result.excluded).toEqual([])
  })

  it.each([
    'declare function consume(value:Reading):number; expect(consume(sample)).toEqual(2)',
    'declare function consume(value:{sample:Reading}):void; consume({sample}); expect(sample.value).toEqual(20)',
  ])(
    'keeps real input samples used through calls or shorthand properties: %s',
    (usage) => {
      const result = findFixtureCandidates(
        project(
          `import {expect} from 'vitest'; const sample:Reading={label:'North',value:20,rank:2}; ${usage}`,
        ),
      )
      expect(result.candidates).toHaveLength(1)
      expect(result.excluded).toEqual([])
    },
  )

  it('uses the configured source directory and project aliases', () => {
    const root = project(
      'import type {Reading as Sample} from "@/domains/rentals/types/reading.type"; const sample:Sample={label:"North",value:20,rank:2}',
      'client',
    )
    const result = findFixtureCandidates(root, {
      source: 'client',
      project: 'browser.json',
    })
    expect(result.source).toBe('client')
    expect(result.project).toBe('browser.json')
    expect(result.candidates.map((row) => row.file)).toEqual([
      'client/sample.test.ts',
    ])
  })

  it('does not treat a mock module or a production helper as a test', () => {
    const root = project('')
    put(
      root,
      'src/domains/rentals/mocks/example.mock.ts',
      'const sample={active:true}; export {}',
    )
    put(root, 'src/helper.ts', 'const sample={active:true}; export {}')
    expect(findFixtureCandidates(root).candidates).toEqual([])
  })

  it('reports both component contracts of a composed input without excess-property false negatives', () => {
    const result = findFixtureCandidates(
      project(
        'declare function consume(value: Measurement & Flag):void; consume({label:"North",value:20,active:true})',
      ),
    )
    expect(
      result.candidates
        .flatMap((row) => row.contracts.map((contract) => contract.name))
        .toSorted(),
    ).toEqual(['Flag', 'Measurement'])
  })

  it('preserves empty results but fails unavailable or invalid analysis input', () => {
    const root = project('const value = 5')
    expect(findFixtureCandidates(root).candidates).toEqual([])
    expect(() =>
      findFixtureCandidates(root, { project: 'missing.json' }),
    ).toThrow()
    expect(() => findFixtureCandidates(root, { source: 'missing' })).toThrow()
    expect(() =>
      findFixtureCandidates(root, { source: 'src/sample.test.ts' }),
    ).toThrow()
    expect(() => findFixtureCandidates(root, { source: '..' })).toThrow()
    put(root, 'src/sample.test.ts', 'const value = {')
    expect(() => findFixtureCandidates(root)).toThrow(
      'Cannot inspect invalid test source',
    )
  })

  it.each([
    [
      'unresolved import',
      'import {build} from "./missing"; const sample = build()',
    ],
    [
      'invalid assignment',
      'const sample: Reading = {label:"North",value:"bad",rank:2}',
    ],
  ])('rejects unavailable semantic evidence: %s', (_, code) => {
    expect(() => findFixtureCandidates(project(code))).toThrow(
      'Cannot inspect invalid TypeScript project',
    )
  })

  it.each([
    'export type Broken = {value: MissingType}',
    'export type Broken = {',
  ])('rejects invalid canonical contracts: %s', (code) => {
    const root = project('const sample = {active:true}')
    put(root, 'src/domains/rentals/types/broken.type.ts', code)
    expect(() => findFixtureCandidates(root)).toThrow(
      'Cannot inspect invalid TypeScript project',
    )
  })

  it('rejects tests omitted by inherited project exclusions', () => {
    const root = project('const sample = {active:true}')
    put(root, 'base.json', JSON.stringify({ exclude: ['**/*.test.ts'] }))
    put(
      root,
      'tsconfig.app.json',
      JSON.stringify({ extends: './base.json', include: ['src'] }),
    )
    expect(() => findFixtureCandidates(root)).toThrow(
      'Tests missing from the TypeScript project: src/sample.test.ts',
    )
  })

  it('rejects JavaScript tests unavailable to a TypeScript-only project', () => {
    const root = project('')
    put(root, 'src/omitted.spec.js', 'const sample = {active:true}')
    expect(() => findFixtureCandidates(root)).toThrow('src/omitted.spec.js')
  })

  it('keeps review fingerprints independent of the checkout path', () => {
    const code = 'const sample = {active:true}'
    expect(findFixtureCandidates(project(code)).analysis).toEqual(
      findFixtureCandidates(project(code)).analysis,
    )
  })
})

function put(root, file, code) {
  const target = join(root, file)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, code)
}

function project(code, source = 'src') {
  const root = mkdtempSync(join(tmpdir(), 'fixture-candidates-'))
  directories.push(root)
  put(
    root,
    source + '/domains/rentals/types/reading.type.ts',
    `
    export type Measurement = {label:string;value:number}
    export type Reading = Measurement & {rank:number}
    export type Flag = {active:boolean}
    export type Preferences = {minimum?:number}
    export type Activity = {kind:'started';value:number} | {kind:'stopped';reason:string}
    export type Selection = Pick<Reading,'label'>
    export interface Location {latitude:number;longitude:number}
  `,
  )
  put(
    root,
    source + '/domains/rentals/mocks/reading.mock.ts',
    `
    import type {Reading} from '../types/reading.type'
    export function makeReading(value:Reading):Reading {return value}
  `,
  )
  put(
    root,
    'node_modules/vitest/index.d.ts',
    `
    export declare function expect(value:unknown): {toEqual(value:unknown):void}
    export declare const it: {each<T>(values:T[]):(name:string,run:(value:T)=>void)=>void}
  `,
  )
  put(
    root,
    'node_modules/yup/index.d.ts',
    'export declare const schema:{validateSync(value:unknown):unknown}',
  )
  put(
    root,
    source + '/sample.test.ts',
    `import type {Reading,Measurement,Flag,Preferences,Activity,Selection,Location} from './domains/rentals/types/reading.type'\n${code}`,
  )
  const config = JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      paths: { '@/*': ['./' + source + '/*'] },
    },
    include: [source],
  })
  put(root, source === 'src' ? 'tsconfig.app.json' : 'browser.json', config)
  return root
}

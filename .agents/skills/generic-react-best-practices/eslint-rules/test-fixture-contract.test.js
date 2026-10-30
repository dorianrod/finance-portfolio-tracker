import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { Linter } from 'eslint'
import ts from 'typescript'
import tseslint from 'typescript-eslint'
import { afterAll, describe, expect, it } from 'vitest'

import rule from './test-fixture-contract.js'

const root = mkdtempSync(join(tmpdir(), 'fixture-contract-'))
const entity = join(root, 'src/domains/orders/types/order.type.ts')
mkdirSync(dirname(entity), { recursive: true })
writeFileSync(
  entity,
  'export type Order = {id: string; amount: number}; export type Result = Order | {reason: string}',
)
afterAll(() => rmSync(root, { recursive: true, force: true }))

function lint(code, filename = 'src/example.test.ts') {
  const file = join(root, filename)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, code)
  const program = ts.createProgram([file, entity], {
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  })
  return new Linter({ cwd: root })
    .verify(
      code,
      {
        files: ['**/*.ts'],
        languageOptions: {
          parser: tseslint.parser,
          parserOptions: { programs: [program], tsconfigRootDir: root },
        },
        plugins: { local: { rules: { fixture: rule } } },
        rules: { 'local/fixture': 'error' },
      },
      { filename: file },
    )
    .map((message) => ({ id: message.messageId, severity: message.severity }))
}

describe('domain fixture factory ownership', () => {
  const prefix =
    "import type {Order as Purchase, Result} from './domains/orders/types/order.type'; "
  it.each([
    'function sample(): Purchase {return {id: "one", amount: 1}}',
    'const sample = (): Purchase => ({id: "one", amount: 1})',
    'const sample = function(): Purchase {return {id: "one", amount: 1}}',
    'function sample(overrides: Partial<Purchase> = {}): Purchase {return {id: "one", amount: 1, ...overrides}}',
    'function sample(): Result {return {id: "one", amount: 1}}',
  ])('rejects a complete local base: %s', (code) => {
    expect(lint(prefix + code)).toEqual([{ id: 'factory', severity: 2 }])
  })
  it.each([
    'function update(current: Purchase): Purchase {return {...current, amount: 2}}',
    'const expected: Purchase = {id: "one", amount: 1}',
    'function parse(input: unknown): Purchase {return {id: "one", amount: 1}}',
    'function sample() {return {id: "one", amount: 1}}',
    'function sample(overrides: Partial<Purchase>): Purchase {return {...overrides, id: "one", amount: 1}}',
    'function sample(): Purchase {const id = "one"; return {id, amount: 1}}',
  ])(
    'preserves updates, expected values and documented unsupported forms: %s',
    (code) => {
      expect(lint(prefix + code)).toEqual([])
    },
  )
  it('accepts the same complete factory in mocks', () => {
    expect(
      lint(
        "import type {Order} from '../domains/orders/types/order.type'; export function sample(): Order {return {id: 'one', amount: 1}}",
        'src/mocks/order.mock.ts',
      ),
    ).toEqual([])
  })
  it('retains incomplete-cast detection', () => {
    expect(lint(prefix + 'const sample = {id: "one"} as Purchase')).toEqual([
      { id: 'cast', severity: 2 },
    ])
  })
})

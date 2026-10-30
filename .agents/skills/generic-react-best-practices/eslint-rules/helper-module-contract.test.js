import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import helperModuleContract from './helper-module-contract.js'

function lint(
  code,
  filename = 'src/domains/orders/helpers/calculators/calculateTotal.ts',
) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.{js,ts,tsx}'],
      languageOptions: { parser: tseslint.parser },
      plugins: {
        local: { rules: { 'helper-module-contract': helperModuleContract } },
      },
      rules: { 'local/helper-module-contract': 'error' },
    },
    { filename },
  )
}

describe('helper module contracts', () => {
  it.each([
    'export function total() {return 0}',
    'export const total = () => 0',
    'function total() {return 0}; export {total}',
    'function total() {return 0}; const alias = total; export {alias as total}',
    'const total = (() => 0) satisfies () => number; export {total}',
    'export default function total() {return 0}',
    'const total = () => 0; export default total',
  ])('rejects mismatched public helper names: %s', (code) => {
    expect(lint(code)).toMatchObject([{ messageId: 'name', severity: 2 }])
  })

  it.each([
    'export function calculateTotal() {return 0}',
    'function total() {return 0}; export {total as calculateTotal}',
    'export default function calculateTotal() {return 0}',
    'const calculateTotal = () => 0; export default calculateTotal',
    'export type Options = {amount: number}; export function calculateTotal() {return 0}',
    'export const DEFAULT_TOTAL = 0',
    'export {calculateTotal} from "./implementation"',
    'const first = second; const second = first; export {first}',
  ])('preserves matching exports and opaque values: %s', (code) => {
    expect(lint(code)).toEqual([])
  })

  it.each([
    'src/domains/orders/helpers/calculateTotal.ts',
    'src/domains/orders/helpers/utils/calculateTotal.ts',
    'src/shared/helpers/misc/calculateTotal.ts',
  ])('rejects flat or invented categories: %s', (filename) => {
    expect(lint('export function calculateTotal() {}', filename)).toMatchObject(
      [{ messageId: 'category', severity: 2 }],
    )
  })

  it.each([
    'businessRules',
    'formatters',
    'selectors',
    'aggregators',
    'calculators',
    'mappers',
    'presenters',
    'quality',
    'validators',
    'payloads',
    'forms',
    'filters',
    'schemas',
    'links',
  ])('preserves the documented %s category', (category) => {
    expect(
      lint(
        'export function calculateTotal() {}',
        `src/shared/helpers/${category}/nested/calculateTotal.ts`,
      ),
    ).toEqual([])
  })

  it.each([
    'src/domains/orders/helpers/mappers/calculateTotal.test.ts',
    'src/domains/orders/helpers/mappers/calculateTotal.spec.ts',
    'src/domains/orders/helpers/mappers/calculateTotal.d.ts',
    'src/shared/ui/storybook/helpers/calculateTotal.ts',
    'src/domains/orders/mocks/helpers/calculateTotal.ts',
    'src/domains/orders/services/calculateTotal.ts',
    'src/domains/helpers/types/calculateTotal.ts',
    'src/domains/orders/features/helpers/services/calculateTotal.ts',
    'scripts/helpers/calculateTotal.ts',
  ])('preserves non-helper and non-production modules: %s', (filename) => {
    expect(lint('export function otherName() {}', filename)).toEqual([])
  })

  it('rejects a logic suffix without prescribing a responsibility', () => {
    expect(
      lint(
        'export function calculateTotal() {}',
        'src/domains/orders/helpers/calculators/calculateTotal.logic.ts',
      ),
    ).toMatchObject([{ messageId: 'logic', severity: 2 }])
  })

  it.each([
    'src/domains/helpers/helpers/calculators/calculateTotal.ts',
    'src/domains/orders/features/helpers/helpers/calculators/calculateTotal.ts',
    'src/domains/orders/features/mocks/helpers/calculators/calculateTotal.ts',
    'src/shared/helpers/calculators/calculateTotal.js',
  ])(
    'checks helper roles independently of business names and language: %s',
    (filename) => {
      expect(lint('export function otherName() {}', filename)).toMatchObject([
        { messageId: 'name', severity: 2 },
      ])
    },
  )
})

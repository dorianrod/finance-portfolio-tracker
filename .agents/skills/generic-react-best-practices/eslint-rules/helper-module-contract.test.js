import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import helperModuleContract from './helper-module-contract.js'

function lint(
  code,
  filename = 'src/domains/orders/helpers/transformers/calculateTotal.ts',
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

  it.each(['transformers', 'formatters', 'presenters'])(
    'preserves the documented %s category',
    (category) => {
      expect(
        lint(
          'export function calculateTotal() {}',
          `src/shared/helpers/${category}/nested/calculateTotal.ts`,
        ),
      ).toEqual([])
    },
  )

  it.each([
    'businessRules',
    'selectors',
    'aggregators',
    'calculators',
    'mappers',
    'quality',
    'validators',
    'payloads',
    'forms',
    'filters',
    'schemas',
    'links',
  ])('rejects the retired %s category without aliases', (category) => {
    expect(
      lint(
        'export function calculateTotal() {}',
        `src/shared/helpers/${category}/nested/calculateTotal.ts`,
      ),
    ).toMatchObject([{ messageId: 'category', severity: 2 }])
  })

  it.each([
    'src/domains/orders/helpers/transformers/calculateTotal.test.ts',
    'src/domains/orders/helpers/transformers/calculateTotal.spec.ts',
    'src/domains/orders/helpers/transformers/calculateTotal.d.ts',
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
        'src/domains/orders/helpers/transformers/calculateTotal.logic.ts',
      ),
    ).toMatchObject([{ messageId: 'logic', severity: 2 }])
  })

  it.each([
    'src/domains/helpers/helpers/transformers/calculateTotal.ts',
    'src/domains/orders/features/helpers/helpers/transformers/calculateTotal.ts',
    'src/domains/orders/features/mocks/helpers/transformers/calculateTotal.ts',
    'src/shared/helpers/transformers/calculateTotal.js',
  ])(
    'checks helper roles independently of business names and language: %s',
    (filename) => {
      expect(lint('export function otherName() {}', filename)).toMatchObject([
        { messageId: 'name', severity: 2 },
      ])
    },
  )

  it.each([
    "import { object as schema } from 'yup'; export const calculateTotal = schema",
    "export { fetchRows as calculateTotal } from '@/domains/orders/apis/queries/fetchRows'",
    "export * from '@/domains/orders/schemas/orderSchema'",
    "import('@/domains/orders/services/useOrders')",
    "import { useQuery as read } from '@tanstack/react-query'; export const calculateTotal = read",
    "import { get } from 'axios'; export const calculateTotal = get",
    "import { atom } from '@/domains/orders/stores/orders.atoms'; export const calculateTotal = atom",
  ])(
    'rejects transport, acquisition and business-state dependencies: %s',
    (code) => {
      expect(lint(code)).toContainEqual(
        expect.objectContaining({ messageId: 'dependency', severity: 2 }),
      )
    },
  )

  it.each([
    "import { ValidationError as InvalidData } from 'yup'; export const calculateTotal = InvalidData",
    "import { isAxiosError as isTransportError } from 'axios'; export const calculateTotal = isTransportError",
    "export { ValidationError as calculateTotal } from 'yup'",
    "import type { ObjectSchema } from 'yup'; export type Schema = ObjectSchema<{}>",
    "export type { Order } from '@/domains/orders/apis/types/order'",
    "import { value } from '@/domains/apis/types/value'; export const calculateTotal = value",
    'export function calculateTotal(items: readonly number[]) { return items.reduce((sum, item) => sum + item, 0) }',
    "import { useMemo as memo } from 'react'; export function calculateTotal(items: number[]) { return memo(() => items.length, [items]) }",
    'export function calculateTotal(transform: (value: number) => number) { return transform(1) }',
  ])(
    'preserves type edges, explicit data and unrelated transform APIs: %s',
    (code) => {
      expect(lint(code)).toEqual([])
    },
  )

  it.each([
    "import { useEffect as effect } from 'react'; export function calculateTotal() { effect(() => {}, []) }",
    "import * as React from 'react'; const { useLayoutEffect: effect } = React; export function calculateTotal() { effect(() => {}, []) }",
    "import React from 'react'; const effect = React.useInsertionEffect; export function calculateTotal() { effect(() => {}, []) }",
    "import { useState } from 'react'; export function calculateTotal() { return useState(0) }",
    "import { useSetAtom as write } from 'jotai'; export function calculateTotal() { return write(atom) }",
    "import { useNavigate } from 'react-router-dom'; export function calculateTotal() { return useNavigate() }",
  ])('rejects known effects and writable hooks through aliases: %s', (code) => {
    expect(lint(code)).toContainEqual(
      expect.objectContaining({ messageId: 'effect', severity: 2 }),
    )
  })

  it('preserves shadowed effect names', () => {
    expect(
      lint(
        "import { useEffect } from 'react'; export function calculateTotal(useEffect: () => number) { return useEffect() }",
      ),
    ).toEqual([])
  })

  it('rejects context subscription inside a transformer', () => {
    expect(
      lint(
        "import { useContext as read } from 'react'; export function calculateTotal() { return read(context) }",
      ),
    ).toMatchObject([{ messageId: 'context', severity: 2 }])
  })

  it.each(['formatters', 'presenters'])(
    'preserves read-only presentation context in %s',
    (category) => {
      expect(
        lint(
          "import { useContext } from 'react'; export function calculateTotal() { return useContext(context) }",
          `src/shared/helpers/${category}/calculateTotal.ts`,
        ),
      ).toEqual([])
    },
  )

  it.each([
    'export function calculateTotal() { return <span /> }',
    'export function calculateTotal() { return <></> }',
    "import { createElement as element } from 'react'; export function calculateTotal() { return element('span') }",
    "import { jsx as element } from 'react/jsx-runtime'; export function calculateTotal() { return element('span', {}) }",
  ])('rejects rendering inside helpers: %s', (code) => {
    expect(
      lint(code, 'src/shared/helpers/presenters/calculateTotal.tsx'),
    ).toMatchObject([{ messageId: 'jsx', severity: 2 }])
  })
})

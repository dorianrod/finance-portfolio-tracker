import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import componentRole from './component-role.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename) {
  return linter.verify(
    code,
    {
      files: ['**/*.tsx'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          ecmaFeatures: { jsx: true },
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      plugins: {
        local: {
          rules: { 'component-role': componentRole },
        },
      },
      rules: {
        'local/component-role': 'error',
      },
    },
    { filename },
  )
}

describe('component-role', () => {
  it('requires a role suffix on production component modules', () => {
    const messages = lint(
      'export function Card() { return <div /> }',
      'Card.tsx',
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual(['missingRole'])
  })

  it.each(['main.tsx', 'Card.test.tsx', 'Card.spec.tsx'])(
    'exempts %s from role naming',
    (filename) => {
      expect(
        lint('export function Card() { return <div /> }', filename),
      ).toEqual([])
    },
  )

  it('allows feature modules to import business layers', () => {
    const code = `
      import { useAtomValue } from 'jotai'
      import { filtersAtom } from '@/domains/orders/stores/filters.atoms'
      export function Orders() { useAtomValue(filtersAtom); return <div /> }
    `
    expect(lint(code, 'Orders.feature.tsx')).toEqual([])
  })

  it('recognizes state-rendering component modules', () => {
    const code = `
      import { Orders } from './Orders.feature'
      export function OrdersState({ state }) { return state.status === 'ready' ? <Orders /> : null }
    `
    expect(lint(code, 'OrdersState.state.tsx')).toEqual([])
  })

  it.each([
    'jotai',
    'jotai/utils',
    '@tanstack/react-query',
    '@/domains/orders/apis/useOrders',
    '@/domains/orders/services/useOrders',
    '@/domains/orders/stores/filters.atoms',
    '@/domains/orders/helpers/businessRules/canEditOrder',
    '@/domains/orders/helpers/calculators/calculateTotal',
    '@/domains/orders/helpers/filters/orderFilters',
    '@/domains/orders/helpers/mappers/buildOrderRows',
    '@/domains/orders/helpers/quality/orderQuality',
    '@/domains/orders/helpers/validators/validateOrder',
  ])('rejects runtime import %s from a view', (source) => {
    const messages = lint(
      `import { dependency } from '${source}'; export function Card() { return <div>{dependency}</div> }`,
      'Card.view.tsx',
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'viewImportsBusiness',
    ])
  })

  it('rejects a feature imported by a view', () => {
    const messages = lint(
      `import { Orders } from './Orders.feature'; export function Card() { return <Orders /> }`,
      'Card.view.tsx',
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'viewImportsFeature',
    ])
  })

  it('rejects a state-rendering component imported by a view', () => {
    const messages = lint(
      `import { OrdersState } from './OrdersState.state'; export function Card() { return <OrdersState /> }`,
      'Card.view.tsx',
    )
    expect(messages.map(({ messageId }) => messageId)).toEqual([
      'viewImportsState',
    ])
  })

  it('allows type-only business imports from a view', () => {
    const code = `
      import type { Order } from '@/domains/orders/apis/useOrders'
      import { type Filters } from '@/domains/orders/stores/filters.atoms'
      export function Card({ order }: { order: Order }) { return <div>{order.id}</div> }
    `
    expect(lint(code, 'Card.view.tsx')).toEqual([])
  })

  it('enforces the same boundary for re-exports while allowing type re-exports', () => {
    const rejected = lint(
      `export { Orders } from './Orders.feature'`,
      'Card.view.tsx',
    )
    expect(rejected.map(({ messageId }) => messageId)).toEqual([
      'viewImportsFeature',
    ])

    expect(
      lint(
        `export type { Order } from '@/domains/orders/apis/useOrders'`,
        'Card.view.tsx',
      ),
    ).toEqual([])
  })

  it('allows React, visual modules, formatters and other views', () => {
    const code = `
      import { useState } from 'react'
      import { Button } from './Button.view'
      import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
      export function Card() {
        const [open] = useState(false)
        const formatMoney = useFormatMoney()
        return <Button>{open ? formatMoney(1) : 'Closed'}</Button>
      }
    `
    expect(lint(code, 'Card.view.tsx')).toEqual([])
  })
})

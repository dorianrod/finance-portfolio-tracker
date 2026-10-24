import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import stateComponentContract from './state-component-contract.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'OrdersState.state.tsx') {
  return linter.verify(code, {
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
        rules: { 'state-component-contract': stateComponentContract },
      },
    },
    rules: {
      'local/state-component-contract': 'error',
    },
  }, { filename })
}

describe('state-component-contract', () => {
  it.each([
    'jotai',
    '@tanstack/react-query',
    '@/domains/orders/apis/useOrders',
    '@/domains/orders/services/useOrders',
    '@/domains/orders/stores/orders.atoms',
    '@/domains/orders/helpers/mappers/buildOrdersState',
  ])('rejects runtime business dependency %s', (source) => {
    const code = `import { dependency } from '${source}'; export function OrdersState() { return <div>{dependency}</div> }`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual(['stateImportsBusiness'])
  })

  it('rejects hooks in state-rendering components', () => {
    const code = `export function OrdersState() { const value = useOrders(); return <div>{value}</div> }`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual(['stateUsesHook'])
  })

  it('allows type-only business imports and rendering feature components', () => {
    const code = `
      import type { OrdersViewState } from '@/domains/orders/helpers/mappers/buildOrdersViewState'
      import { Orders } from './Orders.feature'
      export function OrdersState({ state }: { state: OrdersViewState }) {
        switch (state.status) {
          case 'loading': return <p>Loading</p>
          case 'ready': return <Orders orders={state.orders} />
        }
        const exhaustiveState: never = state
        return exhaustiveState
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('enforces the runtime boundary for re-exports', () => {
    expect(lint(`export { buildOrdersState } from '@/domains/orders/helpers/mappers/buildOrdersState'`)
      .map(({ messageId }) => messageId)).toEqual(['stateImportsBusiness'])
    expect(lint(`export type { OrdersViewState } from '@/domains/orders/helpers/mappers/buildOrdersState'`))
      .toEqual([])
  })

  it.each(['Orders.feature.tsx', 'Orders.view.tsx', 'OrdersState.test.tsx'])(
    'ignores %s',
    (filename) => {
      const code = `import { useOrders } from '@/domains/orders/services/useOrders'; export function Orders() { useOrders(); return <div /> }`
      expect(lint(code, filename)).toEqual([])
    },
  )
})

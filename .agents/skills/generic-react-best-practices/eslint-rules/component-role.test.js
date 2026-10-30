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
  it.each([
    './services/useIndeterminateInput',
    '@/shared/ui/services/useIndeterminateInput',
    './stores/disclosureInput.atoms',
    '@/shared/ui/stores/disclosureInput.atoms',
    'jotai',
    'jotai/utils',
  ])('allows shared UI to own its behavior service %s', (source) => {
    expect(
      lint(
        `import { useIndeterminateInput } from '${source}'; export function Checkbox() { return <input ref={useIndeterminateInput(false)} /> }`,
        'src/shared/ui/Checkbox.view.tsx',
      ),
    ).toEqual([])
  })

  it.each([
    './services/useSelection',
    '@/domains/orders/services/useOrders',
    'jotai',
  ])('keeps business services forbidden in views: %s', (source) => {
    expect(
      lint(
        `import { dependency } from '${source}'; export function Card() { return <div /> }`,
        'src/domains/orders/Card.view.tsx',
      ).map(({ messageId }) => messageId),
    ).toEqual(['viewImportsBusiness'])
  })

  it.each([
    '@/domains/orders/services/useOrders',
    '@/domains/orders/stores/orderAtom',
    '@/app/stores/sessionAtom',
    '@tanstack/react-query',
  ])(
    'does not permit a shared UI view to import business or server state: %s',
    (source) => {
      expect(
        lint(
          `import { dependency } from '${source}'; export function Card() { return <div /> }`,
          'src/shared/ui/Card.view.tsx',
        ).map(({ messageId }) => messageId),
      ).toEqual(['viewImportsBusiness'])
    },
  )

  it.each([
    'export function Card() {return <span/>}',
    'function Card() {return <span/>}; export {Card as Panel}',
    "import {memo as cache} from 'react'; export const Card = cache(() => <span/>)",
    'export const Card = ({children}) => <>{children}</>',
  ])('rejects a visual-only feature: %s', (code) => {
    expect(lint(code, 'Card.feature.tsx')).toMatchObject([
      { messageId: 'featureWithoutBusiness' },
    ])
  })

  it.each([
    'function Caption() { return <span/> }',
    'const Caption = ({children}) => <>{children}</>',
    'function Caption({children: content}) {return content}',
    'const Caption = ({children = null}) => children',
    'function Caption(props) {return props.children}',
    "const Caption = (props) => props['children']",
    "import {memo as cache} from 'react'; const Caption = cache(() => <span/>)",
  ])('rejects a private view hidden in a feature module: %s', (declaration) => {
    expect(
      lint(
        `import {useAtomValue} from 'jotai'; ${declaration}; export function Orders() {useAtomValue(orderAtom); return <Caption/>}`,
        'Orders.feature.tsx',
      ),
    ).toMatchObject([
      {
        messageId: 'featureWithoutBusiness',
        message: expect.stringContaining('Caption'),
      },
    ])
  })

  it('allows private components that own business state', () => {
    expect(
      lint(
        "import {useAtomValue} from 'jotai'; function Selection() {const selected = useAtomValue(selectionAtom); return <span>{selected}</span>} export function Orders() {return <Selection/>}",
        'Orders.feature.tsx',
      ),
    ).toEqual([])
  })

  it('allows a private presentation component in a view module', () => {
    expect(
      lint(
        'function Caption() {return <span/>} export function Card() {return <Caption/>}',
        'Card.view.tsx',
      ),
    ).toEqual([])
  })

  it('does not mistake a nested callback return for rendered children', () => {
    expect(
      lint(
        'function Transform({children}) { const read = () => children; return null }',
        'Transform.feature.tsx',
      ),
    ).toEqual([])
  })

  it('keeps an opaque hook as a review candidate rather than guessing its role', () => {
    expect(
      lint(
        "import {useCard} from './useCard'; export function Card() {const value = useCard(); return <span>{value}</span>}",
        'Card.feature.tsx',
      ),
    ).toEqual([])
  })

  it.each([
    "import {memo} from 'other-library'; export const Card = memo(() => <span/>)",
    "import {use as read} from 'react'; export function Card({resource}) {const value = read(resource); return <span>{value}</span>}",
    "import {calculateTotal} from './helpers/transformers/total'; const value = calculateTotal(); export function Card() {return <span>{value}</span>}",
  ])('preserves opaque wrappers and referenced business values: %s', (code) => {
    expect(lint(code, 'Card.feature.tsx')).toEqual([])
  })

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
    '@/domains/orders/helpers/transformers/canEditOrder',
    '@/domains/orders/helpers/transformers/groupOrders',
    '@/domains/orders/helpers/transformers/calculateTotal',
    '@/domains/orders/helpers/transformers/orderFilters',
    '@/domains/orders/helpers/transformers/buildOrderRows',
    '@/domains/orders/helpers/transformers/orderQuality',
    '@/domains/orders/helpers/transformers/validateOrder',
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

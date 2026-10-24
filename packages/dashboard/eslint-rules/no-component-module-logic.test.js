import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import noComponentModuleLogic from './no-component-module-logic.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'OrderPanel.feature.tsx') {
  return linter.verify(code, {
    files: ['**/*.{ts,tsx}'],
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
        rules: { 'no-component-module-logic': noComponentModuleLogic },
      },
    },
    rules: {
      'local/no-component-module-logic': 'error',
    },
  }, { filename })
}

describe('no-component-module-logic', () => {
  it.each(['OrderPanel.feature.tsx', 'OrderPanel.state.tsx', 'OrderPanel.view.tsx'])(
    'reports module-level function declarations as hooks or helpers in %s',
    (filename) => {
      const code = `
        function selectVisibleOrders() { return [] }
        function useOrderDocumentTitle() {}
        export function OrderPanel() { return <div /> }
      `

      expect(lint(code, filename).map(({ messageId }) => messageId)).toEqual([
        'extractHelper',
        'extractHook',
      ])
    },
  )

  it('reports arrow functions and function expressions assigned at module level', () => {
    const code = `
      export const getOrderTone = (value: number) => value > 0 ? 'positive' : 'negative'
      const selectOrder = function () { return null }
      export function OrderPanel() { return <div /> }
    `

    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'extractHelper',
      'extractHelper',
    ])
  })

  it('recognizes hooks by the React hook naming convention', () => {
    const code = `
      const use2dPosition = () => ({ x: 0, y: 0 })
      const usefulValue = () => 1
      export function OrderPanel() { return <div /> }
    `

    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'extractHook',
      'extractHelper',
    ])
  })

  it('allows function components, memo and forwardRef declarations', () => {
    const code = `
      function OrderPanel() { return <div /> }
      const OrderCard = () => <article />
      const MemoizedOrder = memo(() => <article />)
      const OrderInput = forwardRef((props, ref) => <input ref={ref} />)
    `

    expect(lint(code)).toEqual([])
  })

  it('allows constants, types, imports and callbacks declared inside a component', () => {
    const code = `
      import type { ReactNode } from 'react'
      type Props = { children?: ReactNode }
      const DEFAULT_LIMIT = 10
      export function OrderPanel({ children }: Props) {
        function handleOpen() {}
        const handleClose = () => {}
        return <button onClick={() => handleOpen() || handleClose()}>{children ?? DEFAULT_LIMIT}</button>
      }
    `

    expect(lint(code)).toEqual([])
  })

  it('reports typed module-level function initializers', () => {
    const code = `
      const selectOrders = (() => []) satisfies () => unknown[]
      export function OrderPanel() { return <div /> }
    `

    expect(lint(code).map(({ messageId }) => messageId)).toEqual(['extractHelper'])
  })

  it('allows PascalCase components wrapped in TypeScript expressions', () => {
    const code = `
      type Component = () => JSX.Element
      const OrderPanel = (() => <div />) satisfies Component
      const OrderCard = (() => <article />) as Component
    `

    expect(lint(code)).toEqual([])
  })

  it('reports a named lowercase default function and allows an anonymous default component', () => {
    expect(lint('export default function selectOrders() { return [] }')
      .map(({ messageId }) => messageId)).toEqual(['extractHelper'])
    expect(lint('export default function () { return <div /> }')).toEqual([])
  })

  it.each([
    ['OrderPanel.test.tsx', 'function selectOrders() { return [] }'],
    ['OrderPanel.spec.tsx', 'const useOrders = () => []'],
    ['OrderPanel.tsx', 'function selectOrders() { return [] }'],
    ['selectOrders.ts', 'function selectOrders() { return [] }'],
  ])('ignores declarations in %s', (filename, code) => {
    expect(lint(code, filename)).toEqual([])
  })

  it.each(['order.logic.ts', 'OrderPanel.logic.tsx', 'order.logic.test.ts'])(
    'reports opaque logic module %s',
    (filename) => {
      expect(lint('export const value = 1', filename).map(({ messageId }) => messageId))
        .toEqual(['renameLogicModule'])
    },
  )
})

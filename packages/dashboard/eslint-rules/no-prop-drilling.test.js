import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import noPropDrilling from './no-prop-drilling.js'

const linter = new Linter({ configType: 'flat' })

function lint(code) {
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
        rules: { 'no-prop-drilling': noPropDrilling },
      },
    },
    rules: {
      'local/no-prop-drilling': 'warn',
    },
  }, { filename: 'component.tsx' })
}

describe('no-prop-drilling', () => {
  it.each([
    {
      name: 'passes a destructured prop directly',
      code: `
        function Child({ value }: { value: string }) { return <span>{value}</span> }
        function Parent({ value }: { value: string }) { return <Child value={value} /> }
      `,
    },
    {
      name: 'passes a property from the props object',
      code: `
        import { Child } from './Child'
        function Parent(props: { value: string }) { return <Child value={props.value} /> }
      `,
    },
    {
      name: 'passes a renamed prop with a default value',
      code: `
        import { Child } from '@/shared/Child'
        function Parent({ value: label = 'fallback' }: { value?: string }) {
          return <Child label={label} />
        }
      `,
    },
    {
      name: 'passes a formatted prop through aliases',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: number }) {
          const firstAlias = value
          const secondAlias = firstAlias
          return <Child label={format(secondAlias)} />
        }
      `,
    },
    {
      name: 'passes a prop through an assignment alias',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: string }) {
          let forwardedValue = ''
          forwardedValue = value
          return <Child value={forwardedValue} />
        }
      `,
    },
    {
      name: 'passes a prop through a nested expression and closure',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: string }) {
          return <Child config={{ values: [value] }} onSelect={() => consume(value)} />
        }
      `,
      expectedCount: 2,
    },
    {
      name: 'passes a value destructured from the rest props',
      code: `
        import { Child } from './Child'
        function Parent({ ignored, ...rest }: { ignored: boolean; value: string }) {
          const { value } = rest
          return <Child value={value} />
        }
      `,
    },
    {
      name: 'passes props from a memoized component',
      code: `
        import { memo } from 'react'
        import { Child } from './Child'
        const Parent = memo(({ value }: { value: string }) => <Child value={value} />)
      `,
    },
    {
      name: 'passes props from a forwardRef component',
      code: `
        import { forwardRef } from 'react'
        import { Child } from './Child'
        const Parent = forwardRef<HTMLDivElement, { value: string }>(
          ({ value }, ref) => <Child value={value} />,
        )
      `,
    },
    {
      name: 'passes props from a class component',
      code: `
        import { Component } from 'react'
        import { Child } from './Child'
        class Parent extends Component<{ value: string }> {
          render() { return <Child value={this.props.value} /> }
        }
      `,
    },
    {
      name: 'reports one warning when an attribute depends on multiple props',
      code: `
        import { Child } from './Child'
        function Parent({ first, second }: { first: string; second: string }) {
          return <Child label={first + second} />
        }
      `,
    },
  ])('$name', ({ code, expectedCount = 1 }) => {
    const messages = lint(code)

    expect(messages).toHaveLength(expectedCount)
    expect(messages.every(({ messageId }) => messageId === 'propDrilling')).toBe(true)
  })

  it.each([
    {
      name: 'allows props on intrinsic elements',
      code: `function Parent({ value }: { value: string }) { return <div data-value={value} /> }`,
    },
    {
      name: 'allows props on external components',
      code: `
        import { Button } from 'design-system'
        function Parent({ value }: { value: string }) { return <Button value={value} /> }
      `,
    },
    {
      name: 'allows props as JSX children',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: string }) { return <Child>{value}</Child> }
      `,
    },
    {
      name: 'allows values that do not depend on parent props',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: string }) {
          const localValue = 'local'
          return <><span>{value}</span><Child value={localValue} /></>
        }
      `,
    },
    {
      name: 'allows JSX rendered by a non-React class',
      code: `
        import { Child } from './Child'
        class TemplateRenderer {
          props = { value: 'local' }
          render() { return <Child value={this.props.value} /> }
        }
      `,
    },
    {
      name: 'ignores JSX spreads',
      code: `
        import { Child } from './Child'
        function Parent(props: { value: string }) { return <Child {...props} /> }
      `,
    },
    {
      name: 'ignores key and ref attributes',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: string }) {
          return <Child key={value} ref={value} />
        }
      `,
    },
    {
      name: 'does not confuse a shadowed closure parameter with a prop',
      code: `
        import { Child } from './Child'
        function Parent({ value }: { value: string }) {
          return [value].map((value) => <Child value={value} />)
        }
      `,
    },
  ])('$name', ({ code }) => {
    expect(lint(code)).toEqual([])
  })
})

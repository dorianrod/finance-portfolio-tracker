import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noPropDrilling from './no-prop-drilling.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'component.feature.tsx') {
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
          rules: { 'no-prop-drilling': noPropDrilling },
        },
      },
      rules: {
        'local/no-prop-drilling': 'warn',
      },
    },
    { filename },
  )
}

describe('no-prop-drilling', () => {
  it('reports an unchanged prop forwarded through feature components', () => {
    const code = `
      function Leaf({ value }: { value: string }) { return <span>{value}</span> }
      function Middle({ value }: { value: string }) { return <Leaf value={value} /> }
      function Root({ value }: { value: string }) { return <Middle value={value} /> }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'propDrilling',
    ])
  })

  it.each([
    ['call', 'format(value)'],
    ['binary expression', 'value + 1'],
    ['logical expression', 'value || 1'],
    ['conditional expression', 'value > 0 ? value : 0'],
    ['template', '`${value}%`'],
    ['object', '{ value }'],
    ['array', '[value]'],
    ['unary expression', '-value'],
  ])('reports a %s calculated for a feature', (_name, expression) => {
    const code = `
      import { Child } from './Child.feature'
      function Parent({ value }: { value: number }) {
        return <Child result={${expression}} />
      }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'derivedBusinessProp',
    ])
  })

  it('traces calculations through aliases and destructuring', () => {
    const code = `
      import { Child } from './Child.feature'
      function Parent({ first, second }: { first: number; second: number }) {
        const total = first + second
        const [percentage] = calculatePercentages([first, second])
        return <Child total={total} percentage={percentage} />
      }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'derivedBusinessProp',
      'derivedBusinessProp',
    ])
  })

  it('allows the same calculations for a view', () => {
    const code = `
      import { Child } from './Child.view'
      function Parent({ value }: { value: number }) {
        const total = value + 1
        return <Child result={format(total)} />
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('reports a state object constructed inline for a state-rendering component', () => {
    const code = `
      import { Child } from './Child.state'
      function Parent({ loading }: { loading: boolean }) {
        return <Child state={{ status: loading ? 'loading' : 'ready' }} />
      }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'inlineStateConstruction',
    ])
  })

  it('treats values returned by a hook as owned feature inputs', () => {
    const code = `
      import { Child } from './Child.feature'
      function Parent({ value }: { value: number }) {
        const { total } = useTotals({ value })
        return <Child total={total} />
      }
    `
    expect(lint(code)).toEqual([])
  })

  it.each([
    ['direct value', 'value'],
    ['direct property', 'value.total'],
    ['literal', '42'],
    ['callback adapter', '() => onChange(value)'],
  ])('allows a %s passed to a feature', (_name, expression) => {
    const code = `
      import { Child } from './Child.feature'
      function Parent({ value, onChange }: { value: { total: number }; onChange: (value: object) => void }) {
        return <Child result={${expression}} />
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('supports props objects and imported aliases', () => {
    const code = `
      import { Child as BusinessChild } from './Child.feature'
      function Parent(props: { value: number }) {
        return <BusinessChild result={props.value * 2} />
      }
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'derivedBusinessProp',
    ])
  })

  it('ignores intrinsic elements, external components, children, key and ref', () => {
    const code = `
      import { Button } from 'design-system'
      import { Child } from './Child.feature'
      function Parent({ value }: { value: number }) {
        return <><div data-value={value + 1} /><Button value={value + 1} /><Child key={value} ref={value}>{value + 1}</Child></>
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('does not confuse a shadowed closure parameter with a prop', () => {
    const code = `
      import { Child } from './Child.feature'
      function Parent({ value }: { value: number }) {
        return [value].map((value) => <Child result={value + 1} />)
      }
    `
    expect(lint(code)).toEqual([])
  })
})

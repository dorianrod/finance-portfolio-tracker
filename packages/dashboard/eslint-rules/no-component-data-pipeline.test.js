import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import rule from './no-component-data-pipeline.js'

function lint(body, filename = 'Orders.feature.tsx') {
  return new Linter().verify(
    `function Orders({ rows }) { ${body}; return <div /> }`,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { local: { rules: { pipeline: rule } } },
      rules: { 'local/pipeline': 'error' },
    },
    { filename },
  )
}

describe('component collection pipelines', () => {
  it.each([
    `const total = rows.reduce((sum, row) => sum + row.amount, 0)`,
    `const deposits = rows.filter(row => row.type === 'DEPOSIT' && row.amount > 0)`,
    `const showPrice = rows.some(row => Math.abs(row.price - row.amount) > 0.01)`,
    `const selected = useMemo(() => rows.filter(row => row.active && row.amount > 0), [rows])`,
  ])('extracts accumulations and compound predicates: %s', (body) => {
    expect(lint(body).map((message) => message.messageId)).toEqual(['pipeline'])
  })
  it.each([
    `const total = getTotal(rows)`,
    `const present = rows.some(row => row.active)`,
    `const children = rows.map(row => <Row key={row.id} row={row} />)`,
    `const visible = rows.filter(Boolean)`,
    `const found = rows.find(row => row.id === selectedId)`,
  ])('allows rendering maps, helpers and simple lookups: %s', (body) => {
    expect(lint(body)).toEqual([])
  })
  it('excludes test fixtures', () =>
    expect(lint(`rows.reduce((a,b)=>a+b,0)`, 'Orders.test.tsx')).toEqual([]))
})

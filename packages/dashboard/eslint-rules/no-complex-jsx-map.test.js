import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import noComplexJsxMap from './no-complex-jsx-map.js'

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
        rules: { 'no-complex-jsx-map': noComplexJsxMap },
      },
    },
    rules: {
      'local/no-complex-jsx-map': 'error',
    },
  }, { filename: 'List.view.tsx' })
}

describe('no-complex-jsx-map', () => {
  it('allows a map callback that delegates rendering to a component', () => {
    const code = `
      function CategoryList({ categories }) {
        return <div>{categories.map((category) => <CategoryItem key={category.id} category={category} />)}</div>
      }
    `
    expect(lint(code)).toEqual([])
  })

  it('allows namespaced components', () => {
    expect(lint('const rows = items.map((item) => <Table.Row key={item.id} item={item} />)')).toEqual([])
  })

  it.each([
    ['a block callback', `items.map((item) => { const active = item.id === selectedId; return <Item active={active} /> })`],
    ['conditional rendering', `items.map((item) => item.hidden ? <HiddenItem item={item} /> : <Item item={item} />)`],
    ['logic in a component prop', `items.map((item) => <Item item={item} active={item.id === selectedId} />)`],
    ['an inline event handler', `items.map((item) => <Item item={item} onClick={() => select(item)} />)`],
    ['an intrinsic element', `items.map((item) => <span>{item.label}</span>)`],
    ['a fragment', `items.map((item) => <><Item item={item} /></>)`],
    ['a function expression', `items.map(function (item) { return <Item item={item} /> })`],
  ])('rejects %s', (_name, expression) => {
    expect(lint(`const rows = ${expression}`).map(({ messageId }) => messageId)).toEqual([
      'extractComponent',
    ])
  })

  it('ignores maps that transform data without producing JSX', () => {
    expect(lint('const ids = items.map((item) => item.id)')).toEqual([])
  })
})

import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'
import noComplexJsxCondition from './no-complex-jsx-condition.js'

const linter = new Linter({ configType: 'flat' })

function lint(code, filename = 'Summary.view.tsx') {
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
        rules: { 'no-complex-jsx-condition': noComplexJsxCondition },
      },
    },
    rules: {
      'local/no-complex-jsx-condition': 'error',
    },
  }, { filename })
}

describe('no-complex-jsx-condition', () => {
  it.each([
    ['a chained render guard', `const content = <>{status === 'ready' && metric.delta != null && <Delta />}</>`],
    ['a parenthesized chained guard', `const content = <>{status === 'ready' && (metric.delta != null && <Delta />)}</>`],
    ['a compound ternary test', `const content = <>{status === 'ready' && metric.delta != null ? <Delta /> : null}</>`],
  ])('rejects %s', (_name, code) => {
    expect(lint(code).map(({ messageId }) => messageId)).toEqual(['nameCondition'])
  })

  it.each([
    ['an intention-revealing boolean', `const content = <>{shouldShowDelta && <Delta />}</>`],
    ['a single comparison', `const content = <>{items.length === 0 && <Empty />}</>`],
    ['a simple ternary', `const content = <>{isReady ? <Result /> : <Loading />}</>`],
    ['a compound style condition', `const content = <div className={ready && active ? 'on' : 'off'} />`],
    ['a textual conditional', `const content = <p>{ready && active ? 'Ready' : 'Waiting'}</p>`],
  ])('allows %s', (_name, code) => {
    expect(lint(code)).toEqual([])
  })

  it.each(['Summary.test.tsx', 'Summary.spec.tsx'])('ignores %s', (filename) => {
    const code = `const content = <>{ready && value != null && <Result />}</>`
    expect(lint(code, filename)).toEqual([])
  })
})

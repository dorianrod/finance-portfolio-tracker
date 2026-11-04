import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import { translationKeyLiterals } from './translation-key-literals.js'

function keys(expression) {
  let result
  new Linter().verify(`translate(${expression})`, {
    plugins: {
      catalog: {
        rules: {
          collect: {
            meta: { schema: [] },
            create() {
              return {
                CallExpression(node) {
                  result =
                    translationKeyLiterals(node.arguments[0])?.map(
                      (key) => key.value,
                    ) ?? null
                },
              }
            },
          },
        },
      },
    },
    rules: { 'catalog/collect': 'error' },
  })
  return result
}

describe('translation key literals', () => {
  it.each([
    ["'first'", ['first']],
    ["active ? 'first' : 'second'", ['first', 'second']],
    ["active ? key : 'second'", null],
    ['key', null],
    ['undefined', null],
  ])('extracts %s', (expression, expected) => {
    expect(keys(expression)).toEqual(expected)
  })
})

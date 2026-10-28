import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'

import { createTranslationResolver } from '../eslint-rules/translation-bindings.js'
import { translationKeyLiterals } from '../eslint-rules/translation-key-literals.js'

export function collectTranslationKeys(code, filename) {
  const keys = new Set()
  const messages = new Linter().verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: filename.endsWith('.tsx') } },
      },
      plugins: {
        catalog: {
          rules: {
            collect: {
              meta: { schema: [] },
              create(context) {
                const isTranslation = createTranslationResolver(
                  context.sourceCode,
                )
                return {
                  CallExpression(node) {
                    if (!isTranslation(node)) return
                    for (const key of translationKeyLiterals(
                      node.arguments[0],
                    ) ?? [])
                      keys.add(key.value)
                  },
                }
              },
            },
          },
        },
      },
      rules: { 'catalog/collect': 'error' },
    },
    { filename },
  )
  const parseError = messages.find((message) => message.fatal)
  if (parseError) throw new Error(`${filename}: ${parseError.message}`)
  return keys
}

import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import rule from './no-helper-context-params.js'

function lint(
  code,
  filename = 'src/domains/orders/components/Orders.feature.tsx',
) {
  return new Linter().verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: { parser: tseslint.parser },
      plugins: { local: { rules: { context: rule } } },
      rules: { 'local/context': 'error' },
    },
    { filename },
  )
}

describe('helper context signatures and callers', () => {
  it('resolves namespaced formatter hooks and helper aliases', () => {
    expect(
      lint(
        "import * as money from '@/shared/helpers/formatters/useFormatMoney'; import { build } from '@/domains/orders/helpers/mappers/build'; const alias = build; const format = money.useFormatMoney(); alias(rows, format)",
      ).map((message) => message.messageId),
    ).toEqual(['context'])
  })
  it('resolves namespace helper calls', () => {
    expect(
      lint(
        "import {useFormatMoney} from '@/shared/helpers/formatters/useFormatMoney'; import * as helpers from '@/domains/orders/helpers/mappers/build'; const format = useFormatMoney(); helpers.build(rows, format)",
      ).map((message) => message.messageId),
    ).toEqual(['context'])
  })
  it.each([
    `const format = useFormatMoney(); build(rows, value => format(value))`,
    `const format = useFormatMoney(); build(rows, format)`,
    `const format = useFormatMoney(); const alias = format; build({ rows, formatter: alias })`,
    `const { formatMoney: format } = usePositionFormatters(); build(rows, format)`,
  ])(
    'rejects formatter dependencies through aliases and object arguments: %s',
    (body) => {
      const code = `import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'; import { usePositionFormatters } from '@/domains/orders/helpers/formatters/usePositionFormatters'; import { build } from '@/domains/orders/helpers/mappers/build'; ${body}`
      expect(lint(code).map((message) => message.messageId)).toEqual([
        'context',
      ])
    },
  )

  it.each([
    [
      `import { useTranslation as useText } from 'react-i18next'; const { t: text } = useText(); build(text)`,
      'context',
    ],
    [
      `import { useQueryClient } from '@tanstack/react-query'; const client = useQueryClient(); build(client)`,
      'context',
    ],
    [
      `import { useNavigate } from 'react-router-dom'; const go = useNavigate(); build(go)`,
      'context',
    ],
    [
      `import { useStore } from 'jotai'; const store = useStore(); build(store)`,
      'context',
    ],
  ])('rejects resolved context clients: %s', (body, expected) => {
    expect(
      lint(
        `import { build } from '@/domains/orders/helpers/mappers/build'; ${body}`,
      ).map((message) => message.messageId),
    ).toEqual([expected])
  })

  it('rejects typed exported formatter parameters before a caller exists', () => {
    expect(
      lint(
        `import type { useFormatMoney as useMoney } from '@/shared/helpers/formatters/useFormatMoney'; export function build(rows: Row[], format: ReturnType<typeof useMoney>) { return rows.map(format) }`,
        'src/domains/orders/helpers/mappers/build.ts',
      ).map((message) => message.messageId),
    ).toEqual(['context'])
  })

  it.each([
    `const format = useFormatMoney(); build(rows, format(10))`,
    `const transform = value => value * 2; build(rows, transform)`,
    `const { ready } = useTranslation(); build({ ready })`,
    `const amount = useAtomValue(amountAtom); build(amount)`,
    `function inner(format) { build(format) }`,
  ])(
    'allows data, formatted values, ordinary callbacks and shadowed bindings: %s',
    (body) => {
      const code = `import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'; import { useTranslation } from 'react-i18next'; import { useAtomValue } from 'jotai'; import { build } from '@/domains/orders/helpers/mappers/build'; ${body}`
      expect(lint(code)).toEqual([])
    },
  )

  it('allows composing formatter hooks inside a helper hook', () => {
    expect(
      lint(
        `import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'; export function useBuild() { const format = useFormatMoney(); return rows => rows.map(row => format(row.amount)) }`,
        'src/domains/orders/helpers/mappers/useBuild.ts',
      ),
    ).toEqual([])
  })
})

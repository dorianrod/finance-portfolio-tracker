import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noInlineFormatFallback from './no-inline-format-fallback.js'

const linter = new Linter({ configType: 'flat' })
const imports = `
  import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
  import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
  import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
`

function lint(body, filename = 'Summary.view.tsx', prelude = imports) {
  return linter.verify(
    `${prelude}\n${body}`,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: {
        local: {
          rules: { 'no-inline-format-fallback': noInlineFormatFallback },
        },
      },
      rules: { 'local/no-inline-format-fallback': 'error' },
    },
    { filename },
  )
}

describe('no-inline-format-fallback', () => {
  it.each([
    `value == null ? '—' : formatNumber(value, { maximumFractionDigits: 2 })`,
    `value !== null ? formatNumber(value) : '—'`,
    `undefined === value ? '—' : formatNumber(value!)`,
    `value === 0 ? '' : formatNumber(value)`,
    `0 !== value ? formatNumber(value) : ''`,
    `value ? formatNumber(value) : '—'`,
    `!value ? '—' : formatNumber(value)`,
    `record.value == null ? i18n.t('missing') : formatNumber(record.value)`,
    `record['value'] == null ? missingLabel : formatNumber(record['value'])`,
    `record?.value == null ? '—' : formatNumber(record?.value)`,
    `(value as number | null) == null ? '—' : formatNumber(value as number)`,
  ])('rejects a display guard: %s', (expression) => {
    const code = `const formatNumber = useFormatNumber(); const label = ${expression}`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'formatterFallback',
    ])
  })

  it.each([
    ['formatMoney', 'useFormatMoney'],
    ['formatPercentage', 'useFormatPercentage'],
  ])('checks %s in JSX and translation interpolation', (formatter, hook) => {
    const code = `
      const ${formatter} = ${hook}()
      const content = <p>{i18n.t('value', { value: value == null ? '—' : ${formatter}(value) })}</p>
    `
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'formatterFallback',
    ])
  })

  it.each(['??', '||'])('rejects inline input defaults with %s', (operator) => {
    const code = `const formatMoney = useFormatMoney(); const label = formatMoney(value ${operator} 0)`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'inputFallback',
    ])
  })

  it.each([
    `value == null ? <Text>—</Text> : <Text>{formatNumber(value)}</Text>`,
    `value == null ? <Text>—</Text> : formatNumber(value)`,
    `value === 0 ? <Text>{i18n.t('missing')}</Text> : <Text>{formatNumber(value)}</Text>`,
    `value ? <><Text>{formatNumber(value)}</Text></> : <Text>—</Text>`,
    `record.value == null ? <Text>\n —\n </Text> : <Text>\n {formatNumber(record.value)}\n </Text>`,
  ])('rejects a display guard through JSX wrappers: %s', (expression) => {
    const code = `const formatNumber = useFormatNumber(); const label = ${expression}`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'formatterFallback',
    ])
  })

  it.each([
    `if (value == null) return <Text>—</Text>; return <Text>{formatNumber(value)}</Text>`,
    `if (value === 0) { return <Text>{i18n.t('missing')}</Text> }; return formatNumber(value)`,
    `if (value) return formatNumber(value); else return <Text>—</Text>`,
    `if (value != null) { return <Text>{formatNumber(value)}</Text> } else { return <Text>—</Text> }`,
  ])('rejects a return-only display guard: %s', (body) => {
    const code = `function Value({ value }) { const formatNumber = useFormatNumber(); ${body} }`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'formatterFallback',
    ])
  })

  it.each([
    `if (!ready) return <Text>—</Text>; return formatNumber(value)`,
    `if (other == null) return <Text>—</Text>; return formatNumber(value)`,
    `if (value == null) return <Empty />; return formatNumber(value)`,
    `if (value == null) { reportMissing(); return <Text>—</Text> }; return formatNumber(value)`,
    `if (value == null) return <Text>—</Text>; value = getValue(); return formatNumber(value)`,
    `if (value == null) { return <Text>—</Text> } else { reportValue(); return formatNumber(value) }`,
  ])('preserves structural and business return guards: %s', (body) => {
    const code = `function Value({ value }) { const formatNumber = useFormatNumber(); ${body} }`
    expect(lint(code)).toEqual([])
  })

  it('resolves aliases of both the imported hook and its result', () => {
    const code = `const money = useMoney(); const display = money; const label = value == null ? '—' : display(value)`
    const prelude = `import { useFormatMoney as useMoney } from '@/shared/helpers/formatters/useFormatMoney'`
    expect(
      lint(code, undefined, prelude).map(({ messageId }) => messageId),
    ).toEqual(['formatterFallback'])
  })

  it('resolves destructured formatter aliases from the formatter bundle', () => {
    const code = `const { formatMoney: money } = usePositionTableFormatters(); const label = money(record.value ?? 0)`
    const prelude = `import { usePositionTableFormatters } from '@/domains/portfolio/helpers/formatters/usePositionTableFormatters'`
    expect(
      lint(code, undefined, prelude).map(({ messageId }) => messageId),
    ).toEqual(['inputFallback'])
  })

  it.each([
    `formatNumber(value)`,
    `formatNumber(value, { fallback: '—', zeroAsFallback: true })`,
    `formatNumber(value, { fallback: 0 })`,
    `ready ? formatNumber(value) : '—'`,
    `status === 'ready' ? formatNumber(value) : '—'`,
    `other == null ? '—' : formatNumber(value)`,
    `record.other == null ? '—' : formatNumber(record.value)`,
    `record[key] == null ? '—' : formatNumber(record[otherKey])`,
    `value == null ? <Empty /> : formatNumber(value)`,
    `value == null ? <Text><Icon />Missing</Text> : formatNumber(value)`,
    `value == null ? <Text>—</Text> : <Text>{formatNumber(value)}<Details /></Text>`,
    `status === 'ready' ? <Text>{formatNumber(value)}</Text> : <Text>—</Text>`,
    `other == null ? <Text>—</Text> : <Text>{formatNumber(value)}</Text>`,
    `value == null ? null : formatNumber(value)`,
    `value == null ? undefined : formatNumber(value)`,
    `status === 'ready' && value != null ? formatNumber(value) : '—'`,
    `value < 0 ? '—' : formatNumber(value)`,
    `readValue() == null ? '—' : formatNumber(readValue())`,
    `formatNumber((value ?? 0) * 100)`,
  ])('allows %s', (expression) => {
    const code = `const formatNumber = useFormatNumber(); const label = ${expression}`
    expect(lint(code)).toEqual([])
  })

  it.each([
    `function formatNumber(value) { return String(value) }; const label = value == null ? '—' : formatNumber(value)`,
    `const formatNumber = useFormatNumber(); function nested(formatNumber) { return value == null ? '—' : formatNumber(value) }`,
    `const formatNumber = useFormatNumber(); function nested(undefined) { return value === undefined ? '—' : formatNumber(value) }`,
    `let formatNumber = useFormatNumber(); formatNumber = another; const label = value == null ? '—' : formatNumber(value)`,
  ])('does not confuse unrelated or shadowed bindings', (code) => {
    expect(lint(code)).toEqual([])
  })

  it('does not identify an unrelated hook by name alone', () => {
    const prelude = `import { useFormatNumber } from 'another-library'`
    const code = `const formatNumber = useFormatNumber(); const label = value == null ? '—' : formatNumber(value)`
    expect(lint(code, undefined, prelude)).toEqual([])
  })

  it.each([
    'Summary.test.tsx',
    'Summary.spec.tsx',
    'helpers/formatters/useSummary.tsx',
    'helpers/formatters/useSummary.ts',
  ])('ignores %s', (filename) => {
    const code = `const formatNumber = useFormatNumber(); const label = value == null ? '—' : formatNumber(value)`
    expect(lint(code, filename)).toEqual([])
  })
})

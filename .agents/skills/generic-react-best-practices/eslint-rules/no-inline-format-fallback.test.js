import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noInlineFormatFallback from './no-inline-format-fallback.js'

const linter = new Linter({ configType: 'flat' })
const imports = `
  import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
  import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
  import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
  import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
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
    `formatDate(value) || 'No period'`,
    `formatDate(value) ?? 'No period'`,
    `formatDate(value) || i18n.t('missing')`,
    `formatDate(value) || <Text>No period</Text>`,
  ])('rejects a text fallback on a formatter result: %s', (expression) => {
    expect(
      lint(
        `const formatDate = useFormatDate(); const label = ${expression}`,
      ).map(({ messageId }) => messageId),
    ).toEqual(['outputFallback'])
  })

  it.each([
    `const period = formatDate(value); const alias = period; return alias || i18n.t('missing')`,
    `const period = formatDate(value); const missing = 'No period'; return period ?? missing`,
  ])('follows immutable formatted-result and text aliases: %s', (body) => {
    expect(
      lint(
        `function Label() {const formatDate = useFormatDate(); ${body}}`,
      ).map(({ messageId }) => messageId),
    ).toEqual(['outputFallback'])
  })

  it.each([
    `const formatDate = useFormatDate(); const label = formatDate(value, {fallback: 'No period'})`,
    `const formatDate = useFormatDate(); const label = formatDate(value) || <Empty/>`,
    `const formatDate = useFormatDate(); const empty = <Empty/>; const label = formatDate(value) || empty`,
    `const formatDate = useFormatDate(); const element = <Text>{formatDate(value)}</Text>; const label = element || 'No period'`,
    `const formatDate = useFormatDate(); const label = ready ? formatDate(value) : 'No period'`,
    `const formatDate = useFormatDate(); let period = formatDate(value); period = another; const label = period || 'No period'`,
    `const formatDate = useFormatDate(); function Label(period) {return period || 'No period'}`,
    `function formatDate(value) {return value}; const label = formatDate(value) || 'No period'`,
    `const formatDate = useFormatDate(); const first = second; const second = first; const label = first || 'No period'`,
  ])('preserves valid or unresolved result conditions: %s', (code) => {
    expect(lint(code)).toEqual([])
  })

  it.each([
    `value == null ? '' : formatDate(value)`,
    `value != null ? formatDate(value) : ''`,
    `null === value ? '' : formatDate(value)`,
    `null !== value ? formatDate(value) : ''`,
    `value === undefined ? '' : formatDate(value)`,
    `undefined !== value ? formatDate(value) : ''`,
    `value === void 0 ? '' : formatDate(value)`,
    `value === null || value === undefined ? '' : formatDate(value)`,
    `value !== null && value !== undefined ? formatDate(value) : ''`,
    `!(value != null) ? '' : formatDate(value)`,
    `!!value ? formatDate(value) : ''`,
    `Boolean(value) ? formatDate(value) : ''`,
    `!Boolean(value) ? '' : formatDate(value)`,
    `typeof value === 'undefined' ? '' : formatDate(value)`,
    `'undefined' !== typeof value ? formatDate(value) : ''`,
    `value === '' ? '—' : formatDate(value)`,
    `record?.date == null ? '' : formatDate(record.date)`,
    `record['date'] == null ? '' : formatDate(record.date)`,
    `record.date == null ? '' : formatDate(record['date'])`,
    `value == null ? <Text>{''}</Text> : <Text>{formatDate(value)}</Text>`,
    `value == null ? '' : formatDate(value satisfies Date)`,
    `value != null && formatDate(value)`,
    `value && formatDate(value)`,
    `!value || formatDate(value)`,
    `(value != null && formatDate(value)) || ''`,
    `(value != null && formatDate(value)) ?? ''`,
  ])('rejects a date display guard: %s', (expression) => {
    const code = `const formatDate = useFormatDate(); const label = ${expression}`
    expect(lint(code).map(({ messageId }) => messageId)).toEqual([
      'formatterFallback',
    ])
  })

  it.each(['==', '===', '!=', '!=='])(
    'recognizes %s with either operand and either branch',
    (operator) => {
      const code = `const formatDate = useFormatDate();
        const a = value ${operator} null ? '' : formatDate(value);
        const b = null ${operator} value ? formatDate(value) : '';
      `
      expect(lint(code).map(({ messageId }) => messageId)).toEqual([
        'formatterFallback',
        'formatterFallback',
      ])
    },
  )

  it.each([
    "const present = date != null; const available = present; return available ? display(date) : ''",
    "if (date == null) return ''; return display(date)",
    "if (date !== undefined) { return display(date) } else { return '' }",
  ])('follows date formatter and condition aliases: %s', (body) => {
    expect(
      lint(
        `function Label() { const formatter = useDate(); const display = formatter; ${body} }`,
        undefined,
        "import { useFormatDate as useDate } from '@/shared/helpers/formatters/useFormatDate'",
      ).map(({ messageId }) => messageId),
    ).toEqual(['formatterFallback'])
  })

  it.each([
    ['useFormatContact', 'contact'],
    ['useFormatStatusLabel', 'status'],
    ['useFormatCustomValue', 'value'],
  ])('recognizes new formatter hooks without a registry: %s', (hook, value) => {
    expect(
      lint(
        `const display = ${hook}(); const label = ${value} == null ? '' : display(${value})`,
        undefined,
        `import { ${hook} } from '@/domains/orders/helpers/formatters/${hook}'`,
      ).map(({ messageId }) => messageId),
    ).toEqual(['formatterFallback'])
  })

  it.each([
    [
      "const { formatDate: display } = useTableFormatters(); const label = date == null ? '' : display(date)",
      'formatterFallback',
    ],
    [
      "const table = useTableFormatters(); const label = date == null ? '' : table.formatDate(date)",
      'formatterFallback',
    ],
    [
      "const table = useTableFormatters(); const alias = table; const label = date == null ? '' : alias['formatDate'](date)",
      'formatterFallback',
    ],
    [
      "const table = useTableFormatters(); const display = table.formatDate; const label = display(date ?? '')",
      'inputFallback',
    ],
    [
      "const { formatContact: display } = useTableFormatters(); const label = contact == null ? '' : display(contact)",
      'formatterFallback',
    ],
  ])('recognizes generic formatter bundle members: %s', (body, messageId) => {
    expect(
      lint(
        body,
        undefined,
        "import { useTableFormatters } from '@/domains/orders/helpers/formatters/useTableFormatters'",
      ).map(({ messageId }) => messageId),
    ).toEqual([messageId])
  })

  it.each([
    [
      "import { formatDate as display } from '@/shared/helpers/formatters/formatDate'",
      'display',
    ],
    [
      "import * as dates from '@/shared/helpers/formatters/formatDate'",
      'dates.formatDate',
    ],
  ])('recognizes directly imported formatters: %s', (prelude, formatter) => {
    expect(
      lint(
        `const label = date == null ? '' : ${formatter}(date)`,
        undefined,
        prelude,
      ).map(({ messageId }) => messageId),
    ).toEqual(['formatterFallback'])
  })

  it('checks domain shared formatter wrappers', () => {
    expect(
      lint(
        "function useLabel() { const formatDate = useFormatDate(); return value => value == null ? '' : formatDate(value) }",
        'src/domains/orders/shared/helpers/formatters/useLabel.ts',
      ).map(({ messageId }) => messageId),
    ).toEqual(['formatterFallback'])
  })

  it.each([
    `ready && formatDate(value)`,
    `!ready || formatDate(value)`,
    `other != null && formatDate(value)`,
    `value && <><Text>{formatDate(value)}</Text><Details /></>`,
    `value && <Text>{formatDate(value)}</Text>`,
    `value != null && <MetricDelta tone={getTone(value)}>{formatDate(value)}</MetricDelta>`,
    `typeof value === 'string' ? '' : formatDate(value)`,
    `value === 'today' ? '' : formatDate(value)`,
    `value == null ? <Empty /> : formatDate(value)`,
    `value == null ? null : formatDate(value)`,
    `value == null ? undefined : formatDate(value)`,
    `formatDate(value, { fallback: '' })`,
  ])('preserves date business or structural conditions: %s', (expression) => {
    expect(
      lint(`const formatDate = useFormatDate(); const label = ${expression}`),
    ).toEqual([])
  })

  it('preserves a conditional percentage element controlled by an alias', () => {
    expect(
      lint(`
      const formatPercentage = useFormatPercentage();
      const showPercentage = !missing && pct != null;
      const content = showPercentage && <Layout as="span"><Text>{formatPercentage(pct)}</Text></Layout>;
    `),
    ).toEqual([])
  })

  it.each([
    "const formatDate = useFormatDate(); let available = value != null; available = ready; const label = available ? formatDate(value) : ''",
    "const formatDate = useFormatDate(); function label(Boolean) { return Boolean(value) ? formatDate(value) : '' }",
    "const formatDate = useFormatDate(); function label(undefined) { return value === undefined ? '' : formatDate(value) }",
  ])('does not follow reassigned or shadowed date bindings: %s', (code) => {
    expect(lint(code)).toEqual([])
  })

  it('does not identify a local formatter hook by name alone', () => {
    expect(
      lint(
        "function useFormatDate() { return value => String(value) }; const display = useFormatDate(); const label = value == null ? '' : display(value)",
        undefined,
        '',
      ),
    ).toEqual([])
  })

  it('resolves formatter namespaces and relative imports', () => {
    expect(
      lint(
        "function useLabel() { const format = numeric.useFormatNumber(); return value => value == null ? '—' : format(value) }",
        'src/domains/orders/helpers/formatters/useLabel.ts',
        "import * as numeric from '../../../../shared/helpers/formatters/useFormatNumber'",
      ).map((message) => message.messageId),
    ).toEqual(['formatterFallback'])
  })
  it.each([
    "const available = value != null; const label = available ? formatNumber(value) : '—'",
    "const available = status === 'ready' && value != null; const label = available ? formatNumber(value) : '—'",
    "const missing = value == null; if (missing) return '—'; return formatNumber(value)",
  ])('follows immutable boolean aliases: %s', (body) => {
    expect(
      lint(
        `function Value() { const formatNumber = useFormatNumber(); ${body} }`,
      ).map((message) => message.messageId),
    ).toEqual(['formatterFallback'])
  })

  it('also checks formatter wrappers written in TS', () => {
    expect(
      lint(
        "function useLabel() { const formatNumber = useFormatNumber(); return value => value == null ? '—' : formatNumber(value) }",
        'src/domains/orders/helpers/formatters/useLabel.ts',
      ).map((message) => message.messageId),
    ).toEqual(['formatterFallback'])
  })
  it.each([
    `status === 'ready' && value != null ? formatNumber(value) : '—'`,
    `status !== 'ready' || value == null ? '—' : formatNumber(value)`,
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
    'src/shared/helpers/formatters/useSummary.tsx',
    'src/shared/helpers/formatters/useSummary.ts',
  ])('ignores %s', (filename) => {
    const code = `const formatNumber = useFormatNumber(); const label = value == null ? '—' : formatNumber(value)`
    expect(lint(code, filename)).toEqual([])
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatMoney } from './useFormatMoney'

function MoneyPrecisionProbe({
  options,
}: {
  options: Parameters<ReturnType<typeof useFormatMoney>>[1]
}) {
  const formatMoney = useFormatMoney()
  return formatMoney(12.3, options)
}

function MoneyProbe() {
  const formatMoney = useFormatMoney()
  return (
    <>
      {[
        formatMoney(1_234),
        formatMoney(12.3, { style: 'decimal' }),
        formatMoney(2_500_000, { style: 'compact' }),
        formatMoney(1_234_567, { style: 'full' }),
      ].join('|')}
    </>
  )
}

describe('useFormatMoney', () => {
  it('formats the supported money display styles consistently', () => {
    expect(renderToStaticMarkup(<MoneyProbe />)).toBe(
      '€1,234|€12.30|2.5M€|1,234,567 €',
    )
  })

  it.each([
    { options: { minimumFractionDigits: 2 }, expected: '€12.30' },
    {
      options: { style: 'decimal', maximumFractionDigits: 0 },
      expected: '€12',
    },
    {
      options: { style: 'full', minimumFractionDigits: 2 },
      expected: '12.30 €',
    },
  ] as const)(
    'respects partial precision options: $options',
    ({ options, expected }) => {
      expect(
        renderToStaticMarkup(<MoneyPrecisionProbe options={options} />),
      ).toBe(expected)
    },
  )
})

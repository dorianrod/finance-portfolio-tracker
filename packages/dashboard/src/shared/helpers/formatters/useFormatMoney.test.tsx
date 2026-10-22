import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useFormatMoney } from './useFormatMoney'

function MoneyProbe() {
  const formatMoney = useFormatMoney()
  return <>{[
    formatMoney(1_234),
    formatMoney(12.3, { style: 'decimal' }),
    formatMoney(2_500_000, { style: 'compact' }),
    formatMoney(1_234_567, { style: 'full' }),
  ].join('|')}</>
}

describe('useFormatMoney', () => {
  it('formats the supported money display styles consistently', () => {
    expect(renderToStaticMarkup(<MoneyProbe />)).toBe('€1,234|€12.30|2.5M€|1,234,567 €')
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useFormatNumber } from './useFormatNumber'

function NumberProbe() {
  const formatNumber = useFormatNumber()
  return <>{[
    formatNumber(1_234),
    formatNumber(12.345, { maximumFractionDigits: 2 }),
    formatNumber(1.2, { maximumFractionDigits: 2, minimumFractionDigits: 2, signDisplay: 'always' }),
  ].join('|')}</>
}

describe('useFormatNumber', () => {
  it('formats grouped, precise and signed numbers', () => {
    expect(renderToStaticMarkup(<NumberProbe />)).toBe('1,234|12.35|+1.20')
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useFormatPercentage } from './useFormatPercentage'

function PercentageProbe() {
  const formatPercentage = useFormatPercentage()
  return (
    <>
      {[
        formatPercentage(12.36),
        formatPercentage(12.3, { decimals: 2, signed: true }),
        formatPercentage(-5.7, { signed: true, unit: ' pp' }),
        formatPercentage(Number.NaN),
      ].join('|')}
    </>
  )
}

describe('useFormatPercentage', () => {
  it('normalizes precision, signs and units', () => {
    expect(renderToStaticMarkup(<PercentageProbe />)).toBe(
      '12.4%|+12.30%|-5.7 pp|0.0%',
    )
  })
})

import { describe, expect, it } from 'vitest'

import { computeRollingReturns } from './computeRollingReturns'

describe('computeRollingReturns', () => {
  it('uses calendar months when snapshots are missing', () => {
    const sparseSeries = [
      { date: '2024-01', 'Unit price': 100 },
      { date: '2024-07', 'Unit price': 120 },
    ]
    expect(computeRollingReturns(sparseSeries).get('2024-07')).toEqual([
      { period: 'six-months', pct: (120 / 100 - 1) * 100 },
      { period: 'since-start', pct: (120 / 100 - 1) * 100 },
    ])
  })

  const series = Array.from({ length: 13 }, (_, i) => ({
    date: `${2023 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`,
    'Unit price': 100 + i * 10, // m0=100 ... m12=220
  }))

  it('computes 6m, 1y and since-start returns relative to the hovered point', () => {
    const rows = computeRollingReturns(series).get('2024-01')
    expect(rows).toEqual([
      { period: 'six-months', pct: (220 / 160 - 1) * 100 },
      { period: 'one-year', pct: (220 / 100 - 1) * 100 },
      { period: 'since-start', pct: (220 / 100 - 1) * 100 },
    ])
  })

  it('does not invent a result for an absent month', () => {
    expect(computeRollingReturns(series).get('unknown')).toBeUndefined()
  })
})

describe('rolling return reference prices', () => {
  it.each([0, Number.NaN, Number.POSITIVE_INFINITY])(
    'omits a non-computable reference price %s',
    (reference) => {
      expect(
        computeRollingReturns([
          { date: '2024-01', 'Unit price': reference },
          { date: '2024-07', 'Unit price': 120 },
        ]).get('2024-07'),
      ).toEqual([])
    },
  )

  it('does not mistake six observations for a six-month period', () => {
    expect(
      computeRollingReturns([
        { date: '2023-01', 'Unit price': 100 },
        { date: '2023-02', 'Unit price': 101 },
        { date: '2023-03', 'Unit price': 102 },
        { date: '2023-04', 'Unit price': 103 },
        { date: '2023-05', 'Unit price': 104 },
        { date: '2023-06', 'Unit price': 105 },
        { date: '2024-01', 'Unit price': 120 },
      ]).get('2024-01'),
    ).toEqual([
      { period: 'one-year', pct: (120 / 100 - 1) * 100 },
      { period: 'since-start', pct: (120 / 100 - 1) * 100 },
    ])
  })

  it('keeps a zero current price distinct from an unavailable price', () => {
    expect(
      computeRollingReturns([
        { date: '2024-01', 'Unit price': 100 },
        { date: '2024-07', 'Unit price': 0 },
      ]).get('2024-07'),
    ).toEqual([
      { period: 'six-months', pct: -100 },
      { period: 'since-start', pct: -100 },
    ])
  })

  it('returns no periods for an empty history', () => {
    expect(computeRollingReturns([])).toEqual(new Map())
  })
})

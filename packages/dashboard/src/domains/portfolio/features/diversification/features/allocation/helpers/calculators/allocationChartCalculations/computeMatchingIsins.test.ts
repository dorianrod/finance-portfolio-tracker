import { describe, expect, it } from 'vitest'

import { computeMatchingIsins } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/computeMatchingIsins'
import { rawData } from '@/domains/portfolio/features/diversification/shared/mocks/rawIsinData.mock'

describe('computeMatchingIsins', () => {
  it('returns isins whose latest snapshot has a positive value for the filtered category', () => {
    const data = rawData({
      geo: [
        {
          snapshot_date: new Date('2024-01-01'),
          isin: 'A',
          name: 'A',
          values: { france: 100 },
        },
        {
          snapshot_date: new Date('2024-02-01'),
          isin: 'A',
          name: 'A',
          values: { france: 0, europe: 50 },
        },
        {
          snapshot_date: new Date('2024-02-01'),
          isin: 'B',
          name: 'B',
          values: { france: 30 },
        },
        {
          snapshot_date: new Date('2024-01-01'),
          isin: 'OLD',
          name: 'Closed position',
          values: { france: 500 },
        },
      ],
    })
    expect(
      computeMatchingIsins(data, { type: 'geo', value: 'france' }),
    ).toEqual(new Set(['B']))
  })

  it('returns an empty set when there is no active filter', () => {
    expect(computeMatchingIsins(rawData(), null)).toEqual(new Set())
  })
})

import { describe, expect, it } from 'vitest'

import { computeTableRows } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/computeTableRows'
import { rawData } from '@/domains/portfolio/features/diversification/shared/mocks/rawIsinData.mock'

describe('computeTableRows', () => {
  it('uses only the global latest snapshot and combines duplicate isin rows', () => {
    const data = rawData({
      geo: [
        {
          snapshot_date: new Date('2024-01-01'),
          isin: 'OLD',
          name: 'Closed asset',
          values: { france: 500 },
        },
        {
          snapshot_date: new Date('2024-02-01'),
          isin: 'A',
          name: 'Asset A',
          values: { france: 100, europe: 50 },
        },
        {
          snapshot_date: new Date('2024-02-01'),
          isin: 'B',
          name: 'Asset B',
          values: { france: 20 },
        },
        {
          snapshot_date: new Date('2024-02-01'),
          isin: 'B',
          name: 'Asset B',
          values: { france: 5, europe: 5 },
        },
      ],
    })
    const matching = new Set(['OLD', 'A', 'B'])
    const rows = computeTableRows(data, matching, {
      type: 'geo',
      value: 'france',
    })
    expect(rows).toEqual([
      { isin: 'A', name: 'Asset A', totalValue: 150, filteredValue: 100 },
      { isin: 'B', name: 'Asset B', totalValue: 30, filteredValue: 25 },
    ])
  })
})

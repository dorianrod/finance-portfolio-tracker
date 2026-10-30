import { describe, expect, it } from 'vitest'

import { rawData } from '@/domains/portfolio/shared/mocks/rawIsinData.mock'
import { isinRow as fixtureRawIsinRow } from '@/domains/portfolio/shared/mocks/rawIsinRow.mock'

import { computeTableRows } from './computeTableRows'

describe('computeTableRows', () => {
  it.each(['constructor', '__proto__', 'toString'])(
    'counts only own allocation values for %s across accounts',
    (category) => {
      const data = rawData({
        geo: [
          fixtureRawIsinRow({
            snapshot_date: new Date('2026-01-31'),
            isin: 'A',
            name: 'Asset A',
            values: { [category]: 10 },
          }),
          fixtureRawIsinRow({
            snapshot_date: new Date('2026-01-31'),
            isin: 'A',
            name: 'Asset A',
            values: { france: 5 },
          }),
        ],
      })
      expect(
        computeTableRows(data, new Set(['A']), {
          type: 'geo',
          value: category,
        }),
      ).toEqual([
        { isin: 'A', name: 'Asset A', totalValue: 15, filteredValue: 10 },
      ])
    },
  )

  it('uses only the global latest snapshot and combines duplicate isin rows', () => {
    const data = rawData({
      geo: [
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-01-01'),
          isin: 'OLD',
          name: 'Closed asset',
          values: { france: 500 },
        }),
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-02-01'),
          isin: 'A',
          name: 'Asset A',
          values: { france: 100, europe: 50 },
        }),
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-02-01'),
          isin: 'B',
          name: 'Asset B',
          values: { france: 20 },
        }),
        fixtureRawIsinRow({
          snapshot_date: new Date('2024-02-01'),
          isin: 'B',
          name: 'Asset B',
          values: { france: 5, europe: 5 },
        }),
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

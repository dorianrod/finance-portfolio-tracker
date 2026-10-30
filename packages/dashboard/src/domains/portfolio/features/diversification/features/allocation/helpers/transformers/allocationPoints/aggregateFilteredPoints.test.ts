import { describe, expect, it } from 'vitest'

import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

import { aggregateFilteredPoints } from './aggregateFilteredPoints'

describe('aggregateFilteredPoints', () => {
  it('sums category values across matching isins by date, sorted with nc last', () => {
    const rows: RawIsinRow[] = [
      {
        snapshot_date: new Date('2024-01-01'),
        isin: 'A',
        name: 'A',
        values: { france: 10, nc: 2 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        isin: 'B',
        name: 'B',
        values: { france: 5, europe: 20 },
      },
      {
        snapshot_date: new Date('2024-01-01'),
        isin: 'C',
        name: 'C',
        values: { france: 999 },
      }, // not in matchingIsins
    ]
    const result = aggregateFilteredPoints(rows, new Set(['A', 'B']))
    expect(result).toEqual([
      {
        date: new Date('2024-01-01'),
        categories: [
          { name: 'europe', value: 20 },
          { name: 'france', value: 15 },
          { name: 'nc', value: 2 },
        ],
      },
    ])
  })

  it('restricts to a single category when restrictToCategory is provided', () => {
    const rows: RawIsinRow[] = [
      {
        snapshot_date: new Date('2024-01-01'),
        isin: 'A',
        name: 'A',
        values: { france: 10, europe: 20 },
      },
    ]
    const result = aggregateFilteredPoints(rows, new Set(['A']), 'france')
    expect(result).toEqual([
      {
        date: new Date('2024-01-01'),
        categories: [{ name: 'france', value: 10 }],
      },
    ])
  })
})

import { describe, expect, it } from 'vitest'

import { isinRow as fixtureRawIsinRow } from '@/domains/portfolio/shared/mocks/rawIsinRow.mock'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

import { toLatestAllocationByIsin } from './toLatestAllocationByIsin'

describe('toLatestAllocationByIsin', () => {
  it('uses the latest snapshot and sums the same asset across accounts', () => {
    const rows: RawIsinRow[] = [
      fixtureRawIsinRow({
        snapshot_date: new Date('2024-01-01'),
        isin: 'A',
        name: 'Old name',
        values: { france: 1000 },
      }),
      fixtureRawIsinRow({
        snapshot_date: new Date('2024-03-01'),
        isin: 'A',
        name: 'Asset A',
        account: 'PEA',
        values: { france: 20, europe: 30, nc: 5 },
      }),
      fixtureRawIsinRow({
        snapshot_date: new Date('2024-03-01'),
        isin: 'A',
        name: 'Asset A',
        account: 'CTO',
        values: { france: 10, europe: 20, nc: 5 },
      }),
      fixtureRawIsinRow({
        snapshot_date: new Date('2024-02-01'),
        isin: 'B',
        name: 'Asset B',
        values: { usa: 40 },
      }),
    ]
    const result = toLatestAllocationByIsin(rows)
    expect(result.get('A')).toEqual({
      name: 'Asset A',
      point: {
        date: new Date('2024-03-01'),
        categories: [
          { name: 'europe', value: 50 },
          { name: 'france', value: 30 },
          { name: 'nc', value: 10 },
        ],
      },
    })
    expect(result.get('B')).toEqual({
      name: 'Asset B',
      point: {
        date: new Date('2024-02-01'),
        categories: [{ name: 'usa', value: 40 }],
      },
    })
  })

  it('skips rows without an isin', () => {
    expect(
      toLatestAllocationByIsin([
        {
          snapshot_date: new Date('2024-01-01'),
          isin: '',
          name: 'x',
          values: {},
        },
      ]).size,
    ).toBe(0)
  })
})

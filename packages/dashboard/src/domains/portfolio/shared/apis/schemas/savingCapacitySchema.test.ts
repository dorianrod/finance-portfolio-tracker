import { describe, expect, it } from 'vitest'
import { array } from 'yup'

import { SAVING_CAPACITY_SCHEMA } from '@/domains/portfolio/shared/apis/schemas/savingCapacitySchema'
import { aggregateSavingCapacityByAccount } from '@/domains/portfolio/shared/helpers/transformers/aggregateSavingCapacity/aggregateSavingCapacityByAccount'

describe('SAVING_CAPACITY_SCHEMA', () => {
  it('parses the portfolio-wide saving capacity rows', () => {
    const rows = [
      {
        snapshot_date: new Date('2024-01-01'),
        savings_delta: 100.5,
        perf_delta: -20,
      },
    ]
    expect(array(SAVING_CAPACITY_SCHEMA).defined().validateSync(rows)).toEqual([
      { date: new Date('2024-01-01'), savings_delta: 100.5, perf_delta: -20 },
    ])
  })
})

describe('aggregateSavingCapacityByAccount', () => {
  it('sums savings/perf deltas across the selected accounts by date, rounded to cents', () => {
    const rows = [
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'a1',
        savings_delta: 10.001,
        perf_delta: 1,
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'a2',
        savings_delta: 10.001,
        perf_delta: 1,
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'excluded',
        savings_delta: 999,
        perf_delta: 999,
      },
    ]
    expect(
      aggregateSavingCapacityByAccount(rows, new Set(['a1', 'a2'])),
    ).toEqual([
      { date: new Date('2024-01-01'), savings_delta: 20, perf_delta: 2 },
    ])
  })

  it('sorts the result chronologically', () => {
    const rows = [
      {
        snapshot_date: new Date('2024-02-01'),
        account: 'a1',
        savings_delta: 1,
        perf_delta: 1,
      },
      {
        snapshot_date: new Date('2024-01-01'),
        account: 'a1',
        savings_delta: 2,
        perf_delta: 2,
      },
    ]
    expect(
      aggregateSavingCapacityByAccount(rows, new Set(['a1'])).map(
        (p) => p.date,
      ),
    ).toEqual([new Date('2024-01-01'), new Date('2024-02-01')])
  })
})

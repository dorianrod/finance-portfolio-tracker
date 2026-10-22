import { describe, it, expect } from 'vitest'
import { mapSavingCapacity, aggregateSavingCapacityByAccount } from './savingCapacity.logic'

describe('mapSavingCapacity', () => {
  it('parses the portfolio-wide saving capacity rows', () => {
    const rows = [{ snapshot_date: '2024-01-01', savings_delta: '100.5', perf_delta: '-20' }]
    expect(mapSavingCapacity(rows)).toEqual([{ date: '2024-01-01', savings_delta: 100.5, perf_delta: -20 }])
  })

  it('defaults unparseable numbers to 0', () => {
    expect(mapSavingCapacity([{ snapshot_date: '2024-01-01', savings_delta: '', perf_delta: 'n/a' }]))
      .toEqual([{ date: '2024-01-01', savings_delta: 0, perf_delta: 0 }])
  })
})

describe('aggregateSavingCapacityByAccount', () => {
  it('sums savings/perf deltas across the selected accounts by date, rounded to cents', () => {
    const rows = [
      { snapshot_date: '2024-01-01', account: 'a1', savings_delta: '10.001', perf_delta: '1' },
      { snapshot_date: '2024-01-01', account: 'a2', savings_delta: '10.001', perf_delta: '1' },
      { snapshot_date: '2024-01-01', account: 'excluded', savings_delta: '999', perf_delta: '999' },
    ]
    expect(aggregateSavingCapacityByAccount(rows, new Set(['a1', 'a2']))).toEqual([
      { date: '2024-01-01', savings_delta: 20, perf_delta: 2 },
    ])
  })

  it('sorts the result chronologically', () => {
    const rows = [
      { snapshot_date: '2024-02-01', account: 'a1', savings_delta: '1', perf_delta: '1' },
      { snapshot_date: '2024-01-01', account: 'a1', savings_delta: '2', perf_delta: '2' },
    ]
    expect(aggregateSavingCapacityByAccount(rows, new Set(['a1'])).map((p) => p.date)).toEqual(['2024-01-01', '2024-02-01'])
  })
})

import { describe, it, expect } from 'vitest'
import { toLatestByIsin } from './allocationByIsin.logic'

describe('toLatestByIsin', () => {
  it('keeps only the most recent snapshot per isin, sorted nc-last then value desc', () => {
    const rows: Record<string, string>[] = [
      { snapshot_date: '2024-01-01', isin: 'A', name: 'Asset A', france: '10', nc: '5' },
      { snapshot_date: '2024-03-01', isin: 'A', name: 'Asset A', france: '20', europe: '30', nc: '0' },
      { snapshot_date: '2024-02-01', isin: 'B', name: 'Asset B', usa: '40' },
    ]
    const result = toLatestByIsin(rows)
    expect(result.get('A')).toEqual({
      name: 'Asset A',
      point: { date: '2024-03-01', categories: [{ name: 'europe', value: 30 }, { name: 'france', value: 20 }] },
    })
    expect(result.get('B')).toEqual({
      name: 'Asset B',
      point: { date: '2024-02-01', categories: [{ name: 'usa', value: 40 }] },
    })
  })

  it('skips rows without an isin', () => {
    expect(toLatestByIsin([{ snapshot_date: '2024-01-01', isin: '', name: 'x' }]).size).toBe(0)
  })
})

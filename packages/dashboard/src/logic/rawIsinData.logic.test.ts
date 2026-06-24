import { describe, it, expect } from 'vitest'
import { toRawRows } from './rawIsinData.logic'

describe('toRawRows', () => {
  it('keeps only positive category values per isin row, dropping rows without an isin', () => {
    const rows: Record<string, string>[] = [
      { snapshot_date: '2024-01-01', isin: 'A', name: 'Asset A', france: '10', europe: '0', nc: '-5' },
      { snapshot_date: '2024-01-01', isin: '', name: 'No isin', france: '10' },
    ]
    expect(toRawRows(rows)).toEqual([
      { snapshot_date: '2024-01-01', isin: 'A', name: 'Asset A', values: { france: 10 } },
    ])
  })
})

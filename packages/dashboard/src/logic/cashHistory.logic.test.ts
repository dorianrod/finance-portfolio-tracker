import { describe, it, expect } from 'vitest'
import { aggregateBrokerageCash } from './cashHistory.logic'

describe('aggregateBrokerageCash', () => {
  it('sums cumulative cash across brokerage accounts by date, ignoring other categories', () => {
    const rows = [
      { snapshot_date: '2024-01-01', account: 'a1', account_type: 'PEA', account_category: 'brokerage', cumulative_cash: '100' },
      { snapshot_date: '2024-01-01', account: 'a2', account_type: 'CTO', account_category: 'brokerage', cumulative_cash: '50' },
      { snapshot_date: '2024-01-01', account: 'a3', account_type: 'PER', account_category: 'retirement', cumulative_cash: '999' },
      { snapshot_date: '2024-02-01', account: 'a1', account_type: 'PEA', account_category: 'brokerage', cumulative_cash: '120' },
    ]
    expect(aggregateBrokerageCash(rows)).toEqual([
      { date: '2024-01-01', total_broker_cash: 150 },
      { date: '2024-02-01', total_broker_cash: 120 },
    ])
  })

  it('returns an empty array when there are no brokerage rows', () => {
    expect(aggregateBrokerageCash([
      { snapshot_date: '2024-01-01', account: 'a3', account_type: 'PER', account_category: 'retirement', cumulative_cash: '999' },
    ])).toEqual([])
  })
})

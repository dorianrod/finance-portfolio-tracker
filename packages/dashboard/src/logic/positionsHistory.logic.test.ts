import { describe, it, expect } from 'vitest'
import { buildPositionsHistory } from './positionsHistory.logic'

describe('buildPositionsHistory', () => {
  it('aggregates the same asset held in multiple accounts on the same date', () => {
    const rows = [
      { snapshot_date: '2024-01-01', account: 'a1', isin: 'X', ticker: '', name: 'Asset X', total_value: '100', avg_buy_price: '10', quantity: '5', last_price: '20', unrealized_gain_pct: '5' },
      { snapshot_date: '2024-01-01', account: 'a2', isin: 'X', ticker: '', name: 'Asset X', total_value: '50', avg_buy_price: '10', quantity: '2', last_price: '20', unrealized_gain_pct: '5' },
      { snapshot_date: '2024-02-01', account: 'a1', isin: 'X', ticker: '', name: 'Asset X', total_value: '120', avg_buy_price: '10', quantity: '5', last_price: '24', unrealized_gain_pct: '20' },
    ]
    const map = buildPositionsHistory(rows)
    expect(map.get('X')).toEqual([
      { date: '2024-01-01', value: 150, costBasis: 70, pct: 5, last_price: 20 },
      { date: '2024-02-01', value: 120, costBasis: 50, pct: 20, last_price: 24 },
    ])
  })

  it('skips rows with unparseable numeric fields', () => {
    const rows = [
      { snapshot_date: '2024-01-01', account: 'a1', isin: 'X', ticker: '', name: '', total_value: 'oops', avg_buy_price: '10', quantity: '5', last_price: '20', unrealized_gain_pct: '' },
    ]
    expect(buildPositionsHistory(rows).size).toBe(0)
  })

  it('keys by ticker or name when isin is missing', () => {
    const rows = [
      { snapshot_date: '2024-01-01', account: 'a1', isin: '', ticker: 'XYZ', name: 'Some Fund', total_value: '10', avg_buy_price: '1', quantity: '10', last_price: '1', unrealized_gain_pct: '0' },
    ]
    expect(buildPositionsHistory(rows).has('XYZ')).toBe(true)
  })
})

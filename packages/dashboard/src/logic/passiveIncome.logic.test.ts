import { describe, it, expect } from 'vitest'
import { aggregatePassiveIncomeByYear } from './passiveIncome.logic'

const rows = [
  { date: '2023-06-01', account: 'a1', operation_type: 'DIVIDEND', total_amount: '10' },
  { date: '2023-07-01', account: 'a1', operation_type: 'INTEREST', total_amount: '5' },
  { date: '2024-01-01', account: 'a1', operation_type: 'DIVIDEND', total_amount: '20' },
  { date: '2024-01-01', account: 'a2', operation_type: 'DIVIDEND', total_amount: '999' },
  { date: '2023-01-01', account: 'a1', operation_type: 'BUY', total_amount: '-100' },
]

describe('aggregatePassiveIncomeByYear', () => {
  it('groups dividends and interest by year, ignoring other operation types', () => {
    expect(aggregatePassiveIncomeByYear(rows, null)).toEqual([
      { year: '2023', dividends: 10, interest: 5 },
      { year: '2024', dividends: 1019, interest: 0 },
    ])
  })

  it('filters by account when a set is provided', () => {
    expect(aggregatePassiveIncomeByYear(rows, new Set(['a1']))).toEqual([
      { year: '2023', dividends: 10, interest: 5 },
      { year: '2024', dividends: 20, interest: 0 },
    ])
  })

  it('filters by date range', () => {
    expect(aggregatePassiveIncomeByYear(rows, null, '2023-07-01')).toEqual([
      { year: '2023', dividends: 0, interest: 5 },
      { year: '2024', dividends: 1019, interest: 0 },
    ])
  })
})

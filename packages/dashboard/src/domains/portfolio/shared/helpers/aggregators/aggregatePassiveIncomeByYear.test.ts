import { describe, expect, it } from 'vitest'
import type { RawPassiveIncomeOp } from './aggregatePassiveIncomeByYear'

import { aggregatePassiveIncomeByYear } from './aggregatePassiveIncomeByYear'

const rows: RawPassiveIncomeOp[] = [
  { date: new Date('2023-06-01'), account: 'a1', operation_type: 'DIVIDEND', total_amount: 10 },
  { date: new Date('2023-07-01'), account: 'a1', operation_type: 'INTEREST', total_amount: 5 },
  { date: new Date('2024-01-01'), account: 'a1', operation_type: 'DIVIDEND', total_amount: 20 },
  { date: new Date('2024-01-01'), account: 'a2', operation_type: 'DIVIDEND', total_amount: 999 },
  { date: new Date('2023-01-01'), account: 'a1', operation_type: 'BUY', total_amount: -100 },
]

describe('aggregatePassiveIncomeByYear', () => {
  it('groups dividends and interest by year, ignoring other operation types', () => {
    expect(aggregatePassiveIncomeByYear(rows, null)).toEqual([
      { year: 2023, dividends: 10, interest: 5 },
      { year: 2024, dividends: 1019, interest: 0 },
    ])
  })

  it('filters by account when a set is provided', () => {
    expect(aggregatePassiveIncomeByYear(rows, new Set(['a1']))).toEqual([
      { year: 2023, dividends: 10, interest: 5 },
      { year: 2024, dividends: 20, interest: 0 },
    ])
  })

  it('filters by date range', () => {
    expect(aggregatePassiveIncomeByYear(rows, null, new Date('2023-07-01'))).toEqual([
      { year: 2023, dividends: 0, interest: 5 },
      { year: 2024, dividends: 1019, interest: 0 },
    ])
  })
})

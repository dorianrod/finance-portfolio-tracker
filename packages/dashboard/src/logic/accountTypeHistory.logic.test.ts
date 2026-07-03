import { describe, it, expect } from 'vitest'
import { buildAccountTypeHistory } from './accountTypeHistory.logic'
import type { RawPositionRow } from '@/hooks/useAllPositions'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/shared/filters/accountFilter'

function row(overrides: Partial<RawPositionRow>): RawPositionRow {
  return {
    snapshot_date: '2024-01-01',
    account: 'acc1',
    account_type: 'PEA',
    account_category: 'brokerage',
    quantity: '1',
    avg_buy_price: '100',
    total_value: '1000',
    unrealized_gain: '0',
    ...overrides,
  }
}

describe('buildAccountTypeHistory', () => {
  it('sums total value per account type per date, ordered by the fixed category order', () => {
    const rows = [
      row({ account_type: 'Livret', account_category: 'savings', total_value: '500' }),
      row({ account_type: 'PEA', account_category: 'brokerage', total_value: '1000' }),
      row({ account_type: 'PEA', account_category: 'brokerage', total_value: '200', account: 'acc2' }),
    ]
    const { data, accountTypes, typeCategories } = buildAccountTypeHistory(rows, null)
    expect(accountTypes).toEqual(['PEA', 'Livret']) // brokerage (rank 0) before savings (rank 4)
    expect(typeCategories).toEqual({ PEA: 'brokerage', Livret: 'savings' })
    expect(data).toEqual([{ date: '2024-01-01', PEA: 1200, Livret: 500 }])
  })

  it('filters by account when a set is provided', () => {
    const rows = [
      row({ account: 'acc1', total_value: '1000' }),
      row({ account: 'acc2', total_value: '999' }),
    ]
    const { data } = buildAccountTypeHistory(rows, new Set(['acc1']))
    expect(data).toEqual([{ date: '2024-01-01', PEA: 1000 }])
  })

  it('filters synthetic cash separately from other rows in the same account', () => {
    const rows = [
      row({ account: 'acc1', account_type: 'Bourse', total_value: '1000' }),
      row({ account: 'acc1', account_type: 'Bourse – Cash', total_value: '50' }),
    ]
    const { data } = buildAccountTypeHistory(
      rows,
      new Set([`acc1${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )

    expect(data).toEqual([{ date: '2024-01-01', 'Bourse – Cash': 50 }])
  })

  it('ignores rows with no account_type or no total_value', () => {
    const rows = [row({ account_type: '' }), row({ total_value: '' })]
    const { data, accountTypes } = buildAccountTypeHistory(rows, null)
    expect(data).toEqual([])
    expect(accountTypes).toEqual([])
  })
})

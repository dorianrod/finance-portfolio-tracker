import { describe, expect, it } from 'vitest'

import { makeAccountPositionSnapshot as row } from '@/domains/portfolio/features/wealth/mocks/accountPositionSnapshot.mock'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/filters/accountFilter/cashAccountFilterSuffix'

import { buildAccountTypeHistory } from './buildAccountTypeHistory'

describe('buildAccountTypeHistory', () => {
  it('sums total value per account type per date, ordered by the fixed category order', () => {
    const rows = [
      row({
        account_type: 'Livret',
        account_category: 'savings',
        total_value: 500,
      }),
      row({
        account_type: 'PEA',
        account_category: 'brokerage',
        total_value: 1000,
      }),
      row({
        account_type: 'PEA',
        account_category: 'brokerage',
        total_value: 200,
        account: 'acc2',
      }),
    ]
    const { data, accountTypes, typeCategories } = buildAccountTypeHistory(
      rows,
      null,
    )
    expect(accountTypes).toEqual(['PEA', 'Livret']) // brokerage (rank 0) before savings (rank 4)
    expect(typeCategories).toEqual({ PEA: 'brokerage', Livret: 'savings' })
    expect(data).toEqual([
      { date: new Date('2024-01-01'), values: { PEA: 1200, Livret: 500 } },
    ])
  })

  it('filters by account when a set is provided', () => {
    const rows = [
      row({ account: 'acc1', total_value: 1000 }),
      row({ account: 'acc2', total_value: 999 }),
    ]
    const { data } = buildAccountTypeHistory(rows, new Set(['acc1']))
    expect(data).toEqual([
      { date: new Date('2024-01-01'), values: { PEA: 1000 } },
    ])
  })

  it('filters synthetic cash separately from other rows in the same account', () => {
    const rows = [
      row({ account: 'acc1', account_type: 'Bourse', total_value: 1000 }),
      row({ account: 'acc1', account_type: 'Bourse – Cash', total_value: 50 }),
    ]
    const { data } = buildAccountTypeHistory(
      rows,
      new Set([`acc1${CASH_ACCOUNT_FILTER_SUFFIX}`]),
    )

    expect(data).toEqual([
      { date: new Date('2024-01-01'), values: { 'Bourse – Cash': 50 } },
    ])
  })

  it('ignores rows with no account_type or no total_value', () => {
    const rows = [row({ account_type: '' }), row({ total_value: 0 })]
    const { data, accountTypes } = buildAccountTypeHistory(rows, null)
    expect(data).toEqual([])
    expect(accountTypes).toEqual([])
  })

  it('keeps a reserved field name from overwriting the snapshot date', () => {
    const { data } = buildAccountTypeHistory(
      [
        row({ account_type: 'date', total_value: 120 }),
        row({ account_type: 'shares', total_value: 30 }),
      ],
      null,
    )
    expect(data).toEqual([
      {
        date: new Date('2024-01-01'),
        values: { date: 120, shares: 30 },
      },
    ])
  })

  it.each(['__proto__', 'constructor', 'Account.with.dot'])(
    'preserves the literal account type %s and its category',
    (accountType) => {
      const { data, typeCategories } = buildAccountTypeHistory(
        [row({ account_type: accountType, total_value: 120 })],
        null,
      )
      expect(data[0].values[accountType]).toBe(120)
      expect(typeCategories[accountType]).toBe('brokerage')
    },
  )
})

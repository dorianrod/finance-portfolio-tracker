import { describe, expect, it } from 'vitest'

import { makeAccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/mocks/accountTypeHistoryPoint.mock'

import { withAccountTypeHistoryTotals } from './withAccountTypeHistoryTotals'

describe('withAccountTypeHistoryTotals', () => {
  it('totals only selected account types and preserves the source', () => {
    const source = Object.freeze(
      makeAccountTypeHistoryPoint({
        values: Object.freeze({ Brokerage: 120, Savings: -20, Excluded: 999 }),
      }),
    )
    const result = withAccountTypeHistoryTotals(Object.freeze([source]), [
      'Brokerage',
      'Savings',
    ])

    expect(result).toEqual([{ ...source, total: 100 }])
    expect(source).not.toHaveProperty('total')
  })

  it('treats dotted and metadata-like account names as literal own keys', () => {
    const point = makeAccountTypeHistoryPoint({
      values: Object.fromEntries([
        ['Account.with.dot', 3],
        ['date', 5],
        ['__proto__', 7],
      ]),
    })
    expect(
      withAccountTypeHistoryTotals(
        [point],
        ['Account.with.dot', 'date', '__proto__', 'constructor'],
      ),
    ).toEqual([{ ...point, total: 15 }])
  })

  it('keeps missing accounts at zero', () => {
    const point = makeAccountTypeHistoryPoint()
    expect(withAccountTypeHistoryTotals([point], ['Missing'])).toEqual([
      { ...point, total: 0 },
    ])
  })

  it('accepts an empty history', () => {
    expect(withAccountTypeHistoryTotals([], ['Brokerage'])).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'

import { makeAccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/mocks/accountTypeHistoryPoint.mock'

import { withAccountTypeShares } from './withAccountTypeShares'

describe('withAccountTypeShares', () => {
  it('partitions account values into exactly 100% without changing the source', () => {
    const source = makeAccountTypeHistoryPoint()
    const [point] = withAccountTypeShares([source], ['Brokerage', 'Savings'])
    expect(point.shares).toEqual([33.3, 66.7])
    expect(source.values).toEqual({ Brokerage: 1, Savings: 2 })
    expect(source).not.toHaveProperty('shares')
  })

  it('keeps date and chart-key names as literal account values', () => {
    const source = makeAccountTypeHistoryPoint({
      values: { date: 1, 'Account.with.dot': 3 },
    })
    const [point] = withAccountTypeShares(
      [source],
      ['date', 'Account.with.dot'],
    )
    expect(point.date).toEqual(new Date('2026-01-31'))
    expect(point.values).toEqual({ date: 1, 'Account.with.dot': 3 })
    expect(point.shares).toEqual([25, 75])
  })

  it('keeps an absent account at zero instead of inventing a share', () => {
    const [point] = withAccountTypeShares(
      [makeAccountTypeHistoryPoint()],
      ['Missing'],
    )
    expect(point.shares).toEqual([0])
  })

  it('accepts an empty history', () => {
    expect(withAccountTypeShares([], ['Brokerage'])).toEqual([])
  })
})

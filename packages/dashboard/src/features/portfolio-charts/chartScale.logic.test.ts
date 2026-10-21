import { describe, expect, it } from 'vitest'
import type { PortfolioHistoryPoint } from '@/types/history'
import {
  accountTypeShareKey,
  PORTFOLIO_COST_SHARE_KEY,
  PORTFOLIO_GAIN_SHARE_KEY,
  withAccountTypeShares,
  withPortfolioComposition,
} from './chartScale.logic'

const historyPoint: PortfolioHistoryPoint = {
  date: '2026-01-31',
  total_value: 100,
  total_cost_basis: 80,
  unrealized_gain: 20,
  net_cash_injected: 80,
  cash_delta: null,
  tri: null,
  tri_rolling_1y: null,
  tri_rolling_3y: null,
}

describe('chart percentage scales', () => {
  it('turns portfolio components into shares of portfolio value', () => {
    const [point] = withPortfolioComposition([historyPoint])

    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBe(80)
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBe(20)
  })

  it('keeps signed portfolio attribution when performance is negative', () => {
    const [point] = withPortfolioComposition([{
      ...historyPoint,
      total_value: 100,
      total_cost_basis: 125,
      unrealized_gain: -25,
    }])

    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBe(125)
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBe(-25)
  })

  it('partitions account types into exactly 100%', () => {
    const [point] = withAccountTypeShares([{
      date: '2026-01-31',
      Brokerage: 1,
      Savings: 2,
    }], ['Brokerage', 'Savings'])

    expect(point[accountTypeShareKey(0)]).toBe(33.3)
    expect(point[accountTypeShareKey(1)]).toBe(66.7)
  })
})

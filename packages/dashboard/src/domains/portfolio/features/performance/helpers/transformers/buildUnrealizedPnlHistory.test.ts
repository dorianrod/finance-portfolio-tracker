import { describe, expect, it } from 'vitest'

import { makePortfolioHistoryPoint as fixturePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { buildUnrealizedPnlHistory } from './buildUnrealizedPnlHistory'

const point: PortfolioHistoryPoint = fixturePortfolioHistoryPoint({
  total_cost_basis: 125,
  unrealized_gain: -25,
  net_cash_injected: 125,
})

describe('unrealized P&L history', () => {
  it('preserves losses and distinguishes the first snapshot from a zero change', () => {
    const history = [
      point,
      { ...point, date: new Date('2026-02-28') },
      { ...point, date: new Date('2026-03-31'), unrealized_gain: -15 },
    ]
    const result = buildUnrealizedPnlHistory(history)
    expect(result.map((item) => item.unrealized_gain_pct)).toEqual([
      -20, -20, -12,
    ])
    expect(result.map((item) => item.snapshot_change)).toEqual([null, 0, 10])
    expect(history[0]).not.toHaveProperty('snapshot_change')
  })

  it.each([0, -10])(
    'does not calculate a return for a cost basis of %s',
    (cost) => {
      expect(
        buildUnrealizedPnlHistory([{ ...point, total_cost_basis: cost }])[0]
          .unrealized_gain_pct,
      ).toBeNull()
    },
  )
})

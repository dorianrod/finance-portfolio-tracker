import { describe, expect, it } from 'vitest'

import { PORTFOLIO_COST_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioGainShareKey'
import { withPortfolioComposition } from '@/domains/portfolio/features/wealth/components/EvolutionChart/helpers/presenters/withPortfolioComposition'
import { makePortfolioHistoryPoint } from '@/domains/portfolio/shared/mocks/portfolioHistoryPoint.mock'

const historyPoint = makePortfolioHistoryPoint()

describe('withPortfolioComposition', () => {
  it('turns portfolio components into shares of portfolio value', () => {
    const [point] = withPortfolioComposition([historyPoint])

    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBe(80)
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBe(20)
  })

  it('keeps signed portfolio attribution when performance is negative', () => {
    const [point] = withPortfolioComposition([
      {
        ...historyPoint,
        total_value: 100,
        total_cost_basis: 125,
        unrealized_gain: -25,
      },
    ])

    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBe(125)
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBe(-25)
  })

  it('keeps portfolio shares unavailable when cost and loss cancel out', () => {
    const [point] = withPortfolioComposition([
      { ...historyPoint, total_cost_basis: 100, unrealized_gain: -100 },
    ])
    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBeNull()
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBeNull()
  })
})

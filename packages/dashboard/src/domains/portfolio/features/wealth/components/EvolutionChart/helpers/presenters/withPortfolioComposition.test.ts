import { describe, expect, it } from 'vitest'

import { PORTFOLIO_COST_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioGainShareKey'
import { withPortfolioComposition } from '@/domains/portfolio/features/wealth/components/EvolutionChart/helpers/presenters/withPortfolioComposition'
import { makePortfolioCompositionPoint } from '@/domains/portfolio/features/wealth/components/EvolutionChart/mocks/portfolioCompositionPoint.mock'

const historyPoint = makePortfolioCompositionPoint()

describe('withPortfolioComposition', () => {
  it('turns portfolio components into shares of portfolio value', () => {
    const [point] = withPortfolioComposition([historyPoint])

    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBe(80)
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBe(20)
  })

  it('keeps signed portfolio attribution when performance is negative', () => {
    const [point] = withPortfolioComposition([
      makePortfolioCompositionPoint({
        composition: {
          cost: 125,
          gain: -25,
          total: 100,
          costShare: 125,
          gainShare: -25,
        },
      }),
    ])

    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBe(125)
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBe(-25)
  })

  it('keeps portfolio shares unavailable when cost and loss cancel out', () => {
    const [point] = withPortfolioComposition([
      makePortfolioCompositionPoint({
        composition: {
          cost: 100,
          gain: -100,
          total: 0,
          costShare: null,
          gainShare: null,
        },
      }),
    ])
    expect(point[PORTFOLIO_COST_SHARE_KEY]).toBeNull()
    expect(point[PORTFOLIO_GAIN_SHARE_KEY]).toBeNull()
  })
})

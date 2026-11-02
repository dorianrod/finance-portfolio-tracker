import { PORTFOLIO_COST_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioGainShareKey'
import type { PortfolioCompositionPoint } from '@/domains/portfolio/features/wealth/components/EvolutionChart/types/portfolioCompositionPoint.type'

export function withPortfolioComposition(history: PortfolioCompositionPoint[]) {
  return history.map((point) => {
    const { cost, gain, costShare, gainShare } = point.composition
    return {
      ...point,
      total_cost_basis: cost,
      unrealized_gain: gain,
      [PORTFOLIO_COST_SHARE_KEY]: costShare,
      [PORTFOLIO_GAIN_SHARE_KEY]: gainShare,
    }
  })
}

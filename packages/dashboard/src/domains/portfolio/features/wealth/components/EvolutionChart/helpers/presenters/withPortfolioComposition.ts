import { PORTFOLIO_COST_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from '@/domains/portfolio/features/wealth/components/EvolutionChart/constants/portfolioGainShareKey'
import { computePortfolioComposition } from '@/domains/portfolio/features/wealth/components/EvolutionChart/helpers/presenters/computePortfolioComposition'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function withPortfolioComposition(history: PortfolioHistoryPoint[]) {
  return history.map((point) => {
    const { costShare, gainShare } = computePortfolioComposition(point)
    return {
      ...point,
      [PORTFOLIO_COST_SHARE_KEY]: costShare,
      [PORTFOLIO_GAIN_SHARE_KEY]: gainShare,
    }
  })
}

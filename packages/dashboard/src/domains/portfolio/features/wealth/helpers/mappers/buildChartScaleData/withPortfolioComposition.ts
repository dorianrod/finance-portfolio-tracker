import { computePortfolioComposition } from '@/domains/portfolio/features/wealth/helpers/calculators/computePortfolioComposition'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { PORTFOLIO_COST_SHARE_KEY } from './portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from './portfolioGainShareKey'

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

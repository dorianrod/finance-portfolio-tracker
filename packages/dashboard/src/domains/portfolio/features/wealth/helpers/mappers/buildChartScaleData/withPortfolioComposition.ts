import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { PORTFOLIO_COST_SHARE_KEY } from './portfolioCostShareKey'
import { PORTFOLIO_GAIN_SHARE_KEY } from './portfolioGainShareKey'

export function withPortfolioComposition(history: PortfolioHistoryPoint[]) {
  return history.map((point) => {
    const total = point.total_cost_basis + point.unrealized_gain
    return {
      ...point,
      [PORTFOLIO_COST_SHARE_KEY]: signedShare(point.total_cost_basis, total),
      [PORTFOLIO_GAIN_SHARE_KEY]: signedShare(point.unrealized_gain, total),
    }
  })
}

function signedShare(value: number, total: number): number | null {
  return total === 0 ? null : (value / total) * 100
}

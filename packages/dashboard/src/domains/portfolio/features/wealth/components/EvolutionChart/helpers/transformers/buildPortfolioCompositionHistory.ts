import type { PortfolioCompositionPoint } from '@/domains/portfolio/features/wealth/components/EvolutionChart/types/portfolioCompositionPoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import { computePortfolioComposition } from './computePortfolioComposition'

export function buildPortfolioCompositionHistory(
  history: readonly PortfolioHistoryPoint[],
): PortfolioCompositionPoint[] {
  return history.map((point) => ({
    date: point.date,
    composition: computePortfolioComposition(point),
  }))
}

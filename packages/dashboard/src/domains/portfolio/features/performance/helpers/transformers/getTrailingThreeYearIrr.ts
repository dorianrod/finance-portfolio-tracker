import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function getTrailingThreeYearIrr(
  history: readonly PortfolioHistoryPoint[],
): number | null {
  return history.at(-1)?.tri_rolling_3y ?? null
}

import type { UnrealizedPnlPoint } from '@/domains/portfolio/features/performance/types/unrealizedPnlPoint.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function buildUnrealizedPnlHistory(
  history: PortfolioHistoryPoint[],
): UnrealizedPnlPoint[] {
  return history.map((point, index) => ({
    ...point,
    unrealized_gain_pct:
      point.total_cost_basis > 0
        ? (point.unrealized_gain / point.total_cost_basis) * 100
        : null,
    snapshot_change:
      index > 0
        ? point.unrealized_gain - history[index - 1].unrealized_gain
        : null,
  }))
}

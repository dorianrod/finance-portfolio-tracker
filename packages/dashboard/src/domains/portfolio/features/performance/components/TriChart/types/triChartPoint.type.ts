import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export type TriChartPoint = PortfolioHistoryPoint & {
  // A partial or unsolvable one-year cash-flow history has no backfilled return.
  tri_rolling_1y_backfill: number | null
  // A partial or unsolvable three-year cash-flow history has no backfilled return.
  tri_rolling_3y_backfill: number | null
}

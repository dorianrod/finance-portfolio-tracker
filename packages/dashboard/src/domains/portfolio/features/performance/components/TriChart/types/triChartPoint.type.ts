import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export type TriChartPoint = PortfolioHistoryPoint & {
  tri_rolling_1y_backfill: number | null
  tri_rolling_3y_backfill: number | null
}

import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export type UnrealizedPnlPoint = PortfolioHistoryPoint & {
  // The percentage is undefined without a positive cost basis.
  unrealized_gain_pct: number | null
  // The first snapshot has no preceding value for comparison.
  snapshot_change: number | null
}

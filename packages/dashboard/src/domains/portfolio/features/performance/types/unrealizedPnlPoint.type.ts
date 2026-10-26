import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export type UnrealizedPnlPoint = PortfolioHistoryPoint & {
  unrealized_gain_pct: number | null
  snapshot_change: number | null
}

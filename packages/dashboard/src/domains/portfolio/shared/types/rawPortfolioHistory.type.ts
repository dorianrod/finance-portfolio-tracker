// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { PortfolioHistoryPoint } from './portfolioHistoryPoint.type'

// Validated CSV rows keep the source date column before cash enrichment.
export type RawPortfolioHistory = Omit<
  PortfolioHistoryPoint,
  'date' | 'total_broker_cash'
> & {
  snapshot_date: Date
}

// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { RawPortfolioHistory } from './rawPortfolioHistory.type'

export type PortfolioHistoryResponse = {
  accounts: string[]
  history: RawPortfolioHistory[]
}

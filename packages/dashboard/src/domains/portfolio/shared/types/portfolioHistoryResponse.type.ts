// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { ApiHistoryPoint } from './apiHistoryPoint.type'

export type PortfolioHistoryResponse = {
  accounts: string[]
  history: ApiHistoryPoint[]
}

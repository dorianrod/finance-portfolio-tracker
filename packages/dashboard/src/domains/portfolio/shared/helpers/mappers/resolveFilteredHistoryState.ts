// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

// eslint-disable-next-line complexity -- Account-key matching, fallback history, loading and error are one atomic stale-response resolution policy.
export function resolveFilteredHistoryState(
  fallbackHistory: PortfolioHistoryPoint[],
  isFiltered: boolean,
  accountKey: string,
  responseState: FilteredResponseState | null,
) {
  const matchingResponse =
    responseState?.key === accountKey ? responseState : null
  return {
    history: isFiltered
      ? (matchingResponse?.history ?? fallbackHistory)
      : fallbackHistory,
    loading: isFiltered && matchingResponse === null,
    error: matchingResponse?.error ?? null,
  }
}

type FilteredResponseState = {
  key: string
  history: PortfolioHistoryPoint[] | null
  error: string | null
}

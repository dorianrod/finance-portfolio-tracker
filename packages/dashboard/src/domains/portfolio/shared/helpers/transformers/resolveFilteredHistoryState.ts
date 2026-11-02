// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export function resolveFilteredHistoryState(
  fallbackHistory: PortfolioHistoryPoint[],
  isFiltered: boolean,
  accountKey: string,
  responseState: FilteredResponseState | null,
) {
  const matchingResponse =
    responseState?.key === accountKey ? responseState : null
  if (matchingResponse === null)
    return { history: fallbackHistory, loading: isFiltered, error: null }
  return {
    history: isFiltered
      ? (matchingResponse.history ?? fallbackHistory)
      : fallbackHistory,
    loading: false,
    error: matchingResponse.error,
  }
}

type FilteredResponseState = {
  key: string
  // The filtered request may not have produced a successful history yet.
  history: PortfolioHistoryPoint[] | null
  // No request failure has been reported.
  error: Error | null
}

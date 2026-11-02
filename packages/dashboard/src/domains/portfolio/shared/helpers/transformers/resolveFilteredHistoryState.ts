// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Account-key matching, fallback history, loading and error are one atomic stale-response resolution policy.
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
  // The filtered request may not have produced a successful history yet.
  history: PortfolioHistoryPoint[] | null
  // No request failure has been reported.
  error: Error | null
}

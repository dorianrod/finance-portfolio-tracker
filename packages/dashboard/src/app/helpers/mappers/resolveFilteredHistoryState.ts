import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

type FilteredResponseState = {
  key: string
  history: PortfolioHistoryPoint[] | null
  error: string | null
}

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

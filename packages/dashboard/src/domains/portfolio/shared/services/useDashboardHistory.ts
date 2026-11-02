import { useMemo } from 'react'

import { useGetFilteredPortfolioHistoryQuery } from '@/domains/portfolio/shared/apis/queries/useGetFilteredPortfolioHistoryQuery/useGetFilteredPortfolioHistoryQuery'
import { applyAccountFilterToHistory } from '@/domains/portfolio/shared/helpers/transformers/applyAccountFilterToHistory'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/transformers/filterPointsByPeriod'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/transformers/normalizeAccountSelection'
import { resolveFilteredHistoryState } from '@/domains/portfolio/shared/helpers/transformers/resolveFilteredHistoryState'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

export function useDashboardHistory({
  allPositionRows,
  enrichedHistory,
  filters,
}: DashboardHistoryInput) {
  const fallbackAccountHistory = useMemo(
    () =>
      applyAccountFilterToHistory(
        allPositionRows,
        enrichedHistory,
        filters.accounts,
      ),
    [allPositionRows, enrichedHistory, filters.accounts],
  )
  const filteredHistoryQuery = useGetFilteredPortfolioHistoryQuery(
    filters.accounts,
  )
  const { data: queriedAccountHistory } = filteredHistoryQuery
  const filteredAccountKey = useMemo(
    () => normalizeAccountSelection(filters.accounts).join('\u0000'),
    [filters.accounts],
  )
  const filteredHistory = useMemo(
    () =>
      resolveFilteredHistoryState(
        fallbackAccountHistory,
        filters.accounts.size > 0,
        filteredAccountKey,
        !filteredHistoryQuery.isPlaceholderData &&
          (queriedAccountHistory || filteredHistoryQuery.error)
          ? {
              key: filteredAccountKey,
              history: queriedAccountHistory ?? null,
              error: filteredHistoryQuery.error,
            }
          : null,
      ),
    [
      fallbackAccountHistory,
      filters.accounts.size,
      filteredAccountKey,
      queriedAccountHistory,
      filteredHistoryQuery.error,
      filteredHistoryQuery.isPlaceholderData,
    ],
  )
  const displayedHistory = useMemo(
    () =>
      filterPointsByPeriod(
        filteredHistory.history,
        filters.dateFrom,
        filters.dateTo,
      ),
    [filteredHistory.history, filters.dateFrom, filters.dateTo],
  )
  const globalTri = displayedHistory.at(-1)?.tri ?? null
  let irrStatus: IrrStatus = 'ready'
  if (filteredHistory.loading) irrStatus = 'loading'
  else if (filteredHistory.error) irrStatus = 'error'
  return useMemo(
    () => ({
      accountHistory: filteredHistory.history,

      displayedHistory,
      globalTri,
      irrStatus,
    }),
    [filteredHistory, displayedHistory, globalTri, irrStatus],
  )
}

type DashboardHistoryInput = {
  allPositionRows: RawPositionRow[]
  enrichedHistory: PortfolioHistoryPoint[]
  filters: DashboardFilters
}

// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { useMemo } from 'react'

import { useDemoFilteredHistoryAccountsQuery } from '@/domains/portfolio/shared/apis/queries/useFilteredPortfolioHistoryQuery/useDemoFilteredHistoryAccountsQuery'
import { useFilteredPortfolioHistoryQuery } from '@/domains/portfolio/shared/apis/queries/useFilteredPortfolioHistoryQuery/useFilteredPortfolioHistoryQuery'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/filters/filterPointsByPeriod'
import { applyAccountFilterToHistory } from '@/domains/portfolio/shared/helpers/filters/portfolioDataFilters/applyAccountFilterToHistory'
import { buildDemoPresetSelection } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes/buildDemoPresetSelection'
import { isDemoPresetActive } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes/isDemoPresetActive'
import { resolveFilteredHistoryState } from '@/domains/portfolio/shared/helpers/mappers/resolveFilteredHistoryState'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { getErrorMessage } from '@/shared/helpers/presenters/getErrorMessage'

export function useDashboardHistory({
  allAccounts,
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
  const filteredHistoryQuery = useFilteredPortfolioHistoryQuery(
    filters.accounts,
  )
  const demoFilteredHistoryAccountsQuery = useDemoFilteredHistoryAccountsQuery()
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
        filteredHistoryQuery.data || filteredHistoryQuery.error
          ? {
              key: filteredAccountKey,
              history: filteredHistoryQuery.data ?? null,
              error: filteredHistoryQuery.error
                ? getErrorMessage(filteredHistoryQuery.error)
                : null,
            }
          : null,
      ),
    [
      fallbackAccountHistory,
      filters.accounts.size,
      filteredAccountKey,
      filteredHistoryQuery.data,
      filteredHistoryQuery.error,
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
  const irrScopeLabel =
    filters.accounts.size > 0 && irrStatus === 'ready'
      ? i18n.t('ui.usedashboardviewmodel.selectedAccounts')
      : undefined
  const demoPresetAccounts = demoFilteredHistoryAccountsQuery.data ?? null
  const demoPresetSelection = useMemo(
    () => buildDemoPresetSelection(allAccounts, demoPresetAccounts),
    [allAccounts, demoPresetAccounts],
  )
  const demoPresetActive = useMemo(
    () => isDemoPresetActive(filters.accounts, demoPresetAccounts),
    [demoPresetAccounts, filters.accounts],
  )

  return useMemo(
    () => ({
      accountHistory: filteredHistory.history,
      demoPresetActive,
      demoPresetSelection,
      displayedHistory,
      globalTri,
      irrScopeLabel,
      irrStatus,
    }),
    [
      filteredHistory,
      demoPresetActive,
      demoPresetSelection,
      displayedHistory,
      globalTri,
      irrScopeLabel,
      irrStatus,
    ],
  )
}

type DashboardHistoryInput = {
  allAccounts: string[]
  allPositionRows: RawPositionRow[]
  enrichedHistory: PortfolioHistoryPoint[]
  filters: DashboardFilters
}

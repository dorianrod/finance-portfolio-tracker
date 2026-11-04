import { useAtomValue } from 'jotai'

import { PORTFOLIO_HISTORY_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioHistoryQueryOptions'
import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import { useDashboardHistory } from '@/domains/portfolio/shared/services/useDashboardHistory'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

export function usePortfolioHistoryScope() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { data: history = EMPTY_HISTORY } = useCachedPortfolioSourceQuery<
    PortfolioHistoryPoint[]
  >(PORTFOLIO_HISTORY_QUERY_OPTIONS.queryKey)
  const { data: positions = EMPTY_POSITIONS } = useCachedPortfolioSourceQuery<
    RawPositionRow[]
  >(PORTFOLIO_POSITIONS_QUERY_OPTIONS.queryKey)
  return useDashboardHistory({
    filters,
    allPositionRows: positions,
    enrichedHistory: history,
  })
}
const EMPTY_HISTORY: PortfolioHistoryPoint[] = []
const EMPTY_POSITIONS: RawPositionRow[] = []

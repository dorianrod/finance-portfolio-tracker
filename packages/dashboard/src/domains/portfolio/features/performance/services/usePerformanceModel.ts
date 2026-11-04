import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { withoutOperationFilters } from '@/domains/portfolio/features/performance/helpers/transformers/withoutOperationFilters'
import { useDashboardPerformance } from '@/domains/portfolio/features/performance/services/useDashboardPerformance'
import { applyPositionFilters } from '@/domains/portfolio/shared/helpers/transformers/applyPositionFilters'
import { usePortfolioHistoryScope } from '@/domains/portfolio/shared/services/usePortfolioHistoryScope'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { usePortfolioSourceData } from '@/domains/portfolio/shared/services/usePortfolioSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

export function usePerformanceModel() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { currentPositions, positionsAtPeriodEnd } = usePortfolioPositionScope()
  const periodPositions = useMemo(
    () =>
      applyPositionFilters(
        positionsAtPeriodEnd,
        withoutOperationFilters(filters),
      ),
    [positionsAtPeriodEnd, filters],
  )
  const history = usePortfolioHistoryScope()
  const { rawPositions, rawOperations } = usePortfolioSourceData()
  const performance = useDashboardPerformance({
    currentPositions,
    periodPositions,
    filters,
    displayedHistory: history.displayedHistory,
  })
  return { ...performance, ...history, rawPositions, rawOperations }
}

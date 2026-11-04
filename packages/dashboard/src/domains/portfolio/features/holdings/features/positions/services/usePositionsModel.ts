import { useAtomValue } from 'jotai'

import { useSortedPositions } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/useSortedPositions'
import { dashboardPositionSortDirectionAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortDirection.atoms'
import { dashboardPositionSortKeyAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortKey.atoms'
import { usePortfolioFilterOptions } from '@/domains/portfolio/shared/services/usePortfolioFilterOptions'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { usePortfolioSourceData } from '@/domains/portfolio/shared/services/usePortfolioSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

export function usePositionsModel() {
  const { tableFiltered } = usePortfolioPositionScope()
  const { fundHoldings } = usePortfolioSourceData()
  const { allAccountTypes } = usePortfolioFilterOptions()
  const filters = useAtomValue(dashboardFiltersAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const tableData = useSortedPositions(
    tableFiltered,
    filters.hideClosedPositions,
    allAccountTypes,
    sortKey,
    sortDir,
  )
  return {
    tableData,
    fundStatuses: fundHoldings.statuses,
    useGroupedPositionsTable: allAccountTypes.length > 0,
  }
}

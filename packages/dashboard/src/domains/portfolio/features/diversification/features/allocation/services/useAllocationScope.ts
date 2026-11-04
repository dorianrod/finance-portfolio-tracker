import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { prepareAllocationScope } from '@/domains/portfolio/features/diversification/features/allocation/helpers/transformers/prepareAllocationScope'
import { usePortfolioAllocationData } from '@/domains/portfolio/shared/services/usePortfolioAllocationData'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

export function useAllocationScope() {
  const { currentPositions } = usePortfolioPositionScope()
  const rawData = usePortfolioAllocationData()
  const filters = useAtomValue(dashboardFiltersAtom)
  const scope = useMemo(
    () =>
      prepareAllocationScope({
        positions: currentPositions,
        rawData,
        accountFilters: filters.accounts,
      }),
    [currentPositions, rawData, filters.accounts],
  )
  return { ...scope, loading: rawData.loading }
}

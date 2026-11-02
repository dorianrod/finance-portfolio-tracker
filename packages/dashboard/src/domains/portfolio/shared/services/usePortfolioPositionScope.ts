import { useAtomValue } from 'jotai'

import { usePortfolioPositions } from '@/domains/portfolio/shared/helpers/transformers/usePortfolioPositions'
import { usePortfolioSourceData } from '@/domains/portfolio/shared/services/usePortfolioSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

export function usePortfolioPositionScope() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { positions, rawPositions, rawOperations, fundHoldings } =
    usePortfolioSourceData()
  return usePortfolioPositions({
    filters,
    positions,
    rawPositions,
    rawOperations,
    fundData: fundHoldings,
  })
}

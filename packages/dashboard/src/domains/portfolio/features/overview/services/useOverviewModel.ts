import { useAtomValue } from 'jotai'

import { useOverviewComparison } from '@/domains/portfolio/features/overview/helpers/transformers/useOverviewComparison'
import { useGetSavingCapacityQuery } from '@/domains/portfolio/shared/apis/queries/useGetSavingCapacityQuery'
import { usePortfolioHistoryScope } from '@/domains/portfolio/shared/services/usePortfolioHistoryScope'
import { usePortfolioSourceData } from '@/domains/portfolio/shared/services/usePortfolioSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useOverviewModel() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { accountHistory, irrStatus } = usePortfolioHistoryScope()
  const { rawOperations, rawPositions, fundHoldings } = usePortfolioSourceData()
  const { data: savingCapacity = EMPTY_SAVINGS } = useGetSavingCapacityQuery(
    filters.accounts,
  )
  const comparison = useOverviewComparison({
    accountHistory,
    filters,
    fundHoldingsHistory: fundHoldings.history,
    rawOperations,
    rawPositions,
    savingCapacity,
  })
  return { ...comparison, irrStatus }
}
const EMPTY_SAVINGS: SavingCapacityPoint[] = []

import { useAtomValue } from 'jotai'

import { useDashboardWealth } from '@/domains/portfolio/features/wealth/services/useDashboardWealth'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import { useGetSavingCapacityQuery } from '@/domains/portfolio/shared/apis/queries/useGetSavingCapacityQuery'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { usePortfolioHistoryScope } from '@/domains/portfolio/shared/services/usePortfolioHistoryScope'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useWealthModel() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { currentPositions } = usePortfolioPositionScope()
  const { displayedHistory } = usePortfolioHistoryScope()
  const { data: savingCapacity = EMPTY_SAVINGS } = useGetSavingCapacityQuery(
    filters.accounts,
  )
  const { data: allMonthlyOps = EMPTY_OPERATIONS } =
    useCachedPortfolioSourceQuery<MonthlyOperationsByMonth>(
      portfolioQueryKeys.data('monthly-operations'),
    )
  const { data: annualIncomeSavings = EMPTY_INCOME } =
    useCachedPortfolioSourceQuery<AnnualIncomeSavingsPoint[]>(
      portfolioQueryKeys.data('annual-income-savings'),
    )
  const wealth = useDashboardWealth({
    savingCapacity,
    allMonthlyOps,
    annualIncomeSavings,
    currentPositions,
    filters,
  })
  return { ...wealth, displayedHistory }
}
const EMPTY_SAVINGS: SavingCapacityPoint[] = []
const EMPTY_OPERATIONS: MonthlyOperationsByMonth = new Map()
const EMPTY_INCOME: AnnualIncomeSavingsPoint[] = []

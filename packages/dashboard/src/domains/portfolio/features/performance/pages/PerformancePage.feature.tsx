import { useAtomValue } from 'jotai'

import { PerformanceTab } from '@/domains/portfolio/features/performance/pages/PerformanceTab.feature'
import { usePerformanceModel } from '@/domains/portfolio/features/performance/services/usePerformanceModel'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
export function PerformancePage() {
  useGetPortfolioSourcesQuery()
  const model = usePerformanceModel()
  const filters = useAtomValue(dashboardFiltersAtom)
  return (
    <PerformanceTab
      history={model.displayedHistory}
      passiveIncome={model.passiveIncome}
      rawPositions={model.rawPositions}
      rawOperations={model.rawOperations}
      accountFilters={filters.accounts}
      accountTypeFilters={filters.accountTypes}
      dateFrom={filters.dateFrom}
      performance={model.performance}
      income={model.trailingIncome}
      globalTri={model.globalTri}
      irrStatus={model.irrStatus}
    />
  )
}

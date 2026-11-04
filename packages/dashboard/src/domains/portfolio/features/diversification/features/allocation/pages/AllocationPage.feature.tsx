import { useAtomValue } from 'jotai'

import { AllocationSection } from '@/domains/portfolio/features/diversification/features/allocation/components/AllocationSection.feature'
import { useAllocationScope } from '@/domains/portfolio/features/diversification/features/allocation/services/useAllocationScope'
import { dashboardDiversificationViewAtom } from '@/domains/portfolio/features/diversification/shared/stores/dashboardDiversification.atoms'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
export function AllocationPage() {
  useGetPortfolioSourcesQuery()
  const { scopedRawData } = useAllocationScope()
  const filters = useAtomValue(dashboardFiltersAtom)
  const view = useAtomValue(dashboardDiversificationViewAtom)
  return (
    <AllocationSection
      rawData={scopedRawData}
      dateFrom={filters.dateFrom}
      dateTo={filters.dateTo}
      view={view}
    />
  )
}

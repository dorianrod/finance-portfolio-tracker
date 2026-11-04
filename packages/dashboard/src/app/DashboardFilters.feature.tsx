import { useAtomValue } from 'jotai'

import { filterVisibilityForTab } from '@/app/helpers/presenters/filterVisibilityForTab'
import { useResetDashboardFilters } from '@/app/services/useResetDashboardFilters'
import { FilterChipBar } from '@/domains/portfolio/features/diversification/features/allocation/components/FilterChipBar.feature'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import { OverviewPeriodFilter } from '@/domains/portfolio/features/overview/pages/OverviewPeriodFilter/OverviewPeriodFilter.feature'
import { useOverviewModel } from '@/domains/portfolio/features/overview/services/useOverviewModel'
import { ActiveFilterSummary } from '@/domains/portfolio/features/scope-selection/components/filterBar/ActiveFilterSummary/ActiveFilterSummary.feature'
import { FilterPanel } from '@/domains/portfolio/features/scope-selection/components/filterBar/FilterPanel/FilterPanel.feature'
import { ResetFiltersButton } from '@/domains/portfolio/features/scope-selection/components/filterBar/ResetFiltersButton.view'
import type { FilterSummaryItem } from '@/domains/portfolio/features/scope-selection/types/portfolioFilterPresentation.type'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

export function DashboardFilters({
  activeFilterSummaries,
}: {
  activeFilterSummaries: FilterSummaryItem[]
}) {
  const resetDashboardFilters = useResetDashboardFilters()
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const allocationFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const { overviewComparison } = useOverviewModel()
  const filterVisibility = filterVisibilityForTab(activeTab, holdingsView)
  const showResetFilters =
    activeFilterSummaries.length > 0 ||
    (activeTab === 'diversification' && allocationFilter !== null)
  const showAllocationFilter =
    activeTab === 'diversification' && allocationFilter !== null
  const showOverviewPeriodFilter =
    activeTab === 'overview' && overviewComparison !== null
  return (
    <>
      <ActiveFilterSummary items={activeFilterSummaries}>
        {showOverviewPeriodFilter && (
          <ActiveFilterSummary.Leading>
            <OverviewPeriodFilter windows={overviewComparison.windows} />
          </ActiveFilterSummary.Leading>
        )}
        {showAllocationFilter && <FilterChipBar />}
        {showResetFilters && (
          <ActiveFilterSummary.Actions>
            <ResetFiltersButton onReset={resetDashboardFilters} />
          </ActiveFilterSummary.Actions>
        )}
      </ActiveFilterSummary>

      <FilterPanel
        onReset={resetDashboardFilters}
        visibility={filterVisibility}
      />
    </>
  )
}

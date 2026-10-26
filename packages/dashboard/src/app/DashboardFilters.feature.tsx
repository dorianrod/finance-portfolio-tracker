import { useAtomValue } from 'jotai'

import { useResetDashboardFilters } from '@/app/services/useResetDashboardFilters'
import { FilterChipBar } from '@/domains/portfolio/features/diversification/features/allocation/components/FilterChipBar.feature'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilterAtom'
import { OverviewPeriodFilter } from '@/domains/portfolio/features/overview/pages/OverviewPeriodFilter.feature'
import { ActiveFilterSummary } from '@/domains/portfolio/shared/components/filters/filterBar/ActiveFilterSummary.feature'
import { FilterPanel } from '@/domains/portfolio/shared/components/filters/filterBar/FilterPanel.feature'
import { ResetFiltersButton } from '@/domains/portfolio/shared/components/filters/filterBar/ResetFiltersButton.feature'
import { filterSummaries } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/filterSummaries'
import { filterVisibilityForTab } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/filterVisibilityForTab'
import { filterSummariesForTab } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes/filterSummariesForTab'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsViewAtom'

import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardFilters({
  dashboard,
  activeFilterSummaries,
}: {
  dashboard: DashboardViewModel
  activeFilterSummaries: ReturnType<typeof filterSummaries>
}) {
  const resetDashboardFilters = useResetDashboardFilters()
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const allocationFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const { demoPresetSelection, demoPresetActive, overviewComparison } =
    dashboard
  const filterVisibility = filterVisibilityForTab(activeTab, holdingsView)
  const visibleFilterSummaries = filterSummariesForTab(
    activeFilterSummaries,
    activeTab,
  )
  const showResetFilters =
    activeFilterSummaries.length > 0 ||
    (activeTab === 'diversification' && allocationFilter !== null)
  const showAllocationFilter =
    activeTab === 'diversification' && allocationFilter !== null
  const showOverviewPeriodFilter =
    activeTab === 'overview' && overviewComparison !== null
  return (
    <>
      <ActiveFilterSummary items={visibleFilterSummaries}>
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
        demoPresetSelection={demoPresetSelection}
        demoPresetActive={demoPresetActive}
      />
    </>
  )
}

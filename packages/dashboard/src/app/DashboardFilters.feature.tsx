import { useAtomValue } from 'jotai'

import { FilterChipBar } from '@/domains/portfolio/features/allocation/components/FilterChipBar.feature'
import { OverviewPeriodFilter } from '@/domains/portfolio/features/overview/pages/OverviewPeriodFilter.feature'
import {
  ActiveFilterSummary,
  FilterPanel,
  ResetFiltersButton,
} from '@/domains/portfolio/shared/components/filters/FilterBar.feature'
import {
  filterSummaries,
  filterVisibilityForTab,
} from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import { filterSummariesForTab } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes'
import { dashboardAllocationFilterAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'

import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardFilters({
  dashboard,
  activeFilterSummaries,
}: {
  dashboard: DashboardViewModel
  activeFilterSummaries: ReturnType<typeof filterSummaries>
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const allocationFilter = useAtomValue(dashboardAllocationFilterAtom)
  const { demoPresetSelection, demoPresetActive, overviewComparison } =
    dashboard
  const filterVisibility = filterVisibilityForTab(activeTab, holdingsView)
  const visibleFilterSummaries = filterSummariesForTab(
    activeFilterSummaries,
    activeTab,
  )
  const showResetFilters =
    activeFilterSummaries.length > 0 ||
    (activeTab === 'allocation' && allocationFilter !== null)
  const showAllocationFilter =
    activeTab === 'allocation' && allocationFilter !== null
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
            <ResetFiltersButton />
          </ActiveFilterSummary.Actions>
        )}
      </ActiveFilterSummary>

      <FilterPanel
        visibility={filterVisibility}
        demoPresetSelection={demoPresetSelection}
        demoPresetActive={demoPresetActive}
      />
    </>
  )
}

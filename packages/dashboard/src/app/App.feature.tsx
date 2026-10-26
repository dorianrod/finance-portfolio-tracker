import { useAtomValue } from 'jotai'
import { Suspense } from 'react'

import { DashboardLoadState } from '@/app/DashboardLoadState.state'
import { DashboardPanelErrorBoundary } from '@/app/DashboardPanelErrorBoundary.view'
import { useDashboardViewModel } from '@/app/services/useDashboardViewModel'
import { HoldingsViewTabs } from '@/domains/portfolio/features/holdings/components/HoldingsViewTabs.feature'
import {
  filterSummaries,
  filterVisibilityForTab,
} from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

import { DashboardContent } from './DashboardContent.feature'
import { DashboardFilters } from './DashboardFilters.feature'
import { DashboardHeader } from './DashboardHeader.feature'
import { DashboardNavigation } from './DashboardNavigation.feature'
import { DashboardPanelFallback } from './DashboardPanelFallback.view'
import { DashboardSectionHeader } from './DashboardSectionHeader.feature'

export default function App() {
  const formatDate = useFormatDate()
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const dashboard = useDashboardViewModel()
  const { loadState, accountFilterLabels, qualitySummary } = dashboard
  const { hasFundValidationError, hasPipelineError, qualityCount } =
    qualitySummary
  const activeFilterSummaries = filterSummaries(
    filters,
    accountFilterLabels,
    filterVisibilityForTab(activeTab, holdingsView),
    (date) => formatDate(date, { style: 'isoDate' }),
  )
  return (
    <ViewNavigation>
      <div className="min-h-screen">
        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-screen-2xl">
            <DashboardHeader />

            <DashboardLoadState
              state={loadState}
              onRetry={() => window.location.reload()}
            >
              <DashboardNavigation
                activeTab={activeTab}
                hasFundValidationError={hasFundValidationError}
                hasPipelineError={hasPipelineError}
                qualityCount={qualityCount}
              />

              {activeTab === 'holdings' && <HoldingsViewTabs />}

              <DashboardSectionHeader
                dashboard={dashboard}
                activeFilterCount={activeFilterSummaries.length}
              />
              <DashboardFilters
                dashboard={dashboard}
                activeFilterSummaries={activeFilterSummaries}
              />

              <DashboardPanelErrorBoundary
                key={activeTab}
                onRetry={() => window.location.reload()}
              >
                <Suspense fallback={<DashboardPanelFallback />}>
                  <DashboardContent dashboard={dashboard} />
                </Suspense>
              </DashboardPanelErrorBoundary>
            </DashboardLoadState>
          </div>
        </div>
      </div>
    </ViewNavigation>
  )
}

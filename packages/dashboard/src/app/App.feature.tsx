import { useAtomValue } from 'jotai'
import { Suspense } from 'react'

import { DashboardLoadState } from '@/app/DashboardLoadState.state'
import { DashboardNavigation } from '@/app/dashboardNavigation/DashboardNavigation.feature'
import { DashboardPanelErrorBoundary } from '@/app/DashboardPanelErrorBoundary.view'
import { filterVisibilityForTab } from '@/app/helpers/presenters/filterVisibilityForTab'
import { HoldingsViewTabs } from '@/app/HoldingsViewTabs.feature'
import { useDashboardViewModel } from '@/app/services/useDashboardViewModel'
import { useFilterSummaries } from '@/domains/portfolio/features/scope-selection/components/filterBar/ActiveFilterSummary/helpers/presenters/useFilterSummaries'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import i18n from '@/i18n/i18n'
import { StatusMessage } from '@/shared/ui/controls/StatusMessage.view'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

import { DashboardContent } from './DashboardContent.feature'
import { DashboardFilters } from './DashboardFilters.feature'
import { DashboardHeader } from './DashboardHeader.feature'
import { DashboardPanelFallback } from './DashboardPanelFallback.view'
import { DashboardSectionHeader } from './DashboardSectionHeader.feature'
import { DashboardSources } from './DashboardSources.feature'

export default function App() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const dashboard = useDashboardViewModel()
  const { loadState, accountFilterLabels, qualitySummary } = dashboard
  const { hasFundValidationError, hasPipelineError, qualityCount } =
    qualitySummary
  const activeFilterSummaries = useFilterSummaries(
    filters,
    accountFilterLabels,
    filterVisibilityForTab(activeTab, holdingsView),
  )
  return (
    <ViewNavigation>
      <DashboardSources />
      <div className="min-h-screen">
        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-screen-2xl">
            <DashboardHeader />

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

            <DashboardLoadState
              state={loadState}
              onRetry={() => window.location.reload()}
            >
              {dashboard.updating && (
                <StatusMessage tone="muted">
                  {i18n.t('ui.app.updatingSelection')}
                </StatusMessage>
              )}

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

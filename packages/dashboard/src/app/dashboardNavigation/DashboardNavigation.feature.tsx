import { preloadDashboardTab } from '@/app/routing/dashboardTabLoaders/preloadDashboardTab'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/services/actions/useQualityNavigation'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'
import i18n from '@/i18n/i18n'
import { CountBadge } from '@/shared/ui/badge/CountBadge.view'
import { Navigation } from '@/shared/ui/controls/Navigation.view'
import { NavigationButton } from '@/shared/ui/controls/NavigationButton.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

import { PrimaryTabButton } from './PrimaryTabButton.feature'
import { PRIMARY_TABS } from './primaryTabs'

export function DashboardNavigation({
  activeTab,
  hasFundValidationError,
  hasPipelineError,
  qualityCount,
}: {
  activeTab: AnalysisTab
  hasFundValidationError: boolean
  hasPipelineError: boolean
  qualityCount: number
}) {
  const { navigateTo } = useDashboardNavigation()
  const { openQualityOverview } = useQualityNavigation()

  return (
    <div className="mb-5 overflow-x-auto">
      <Navigation variant="tabs" label={i18n.t('ui.app.portfolioAnalyses')}>
        <Inline as="div">
          {PRIMARY_TABS.map((tab) => (
            <PrimaryTabButton
              key={tab.id}
              activeTab={activeTab}
              onNavigate={navigateTo}
              tab={tab}
            />
          ))}
          <Layout as="span" flow="control" placement="trailing" sizing="fixed">
            <NavigationButton
              type="button"
              onClick={openQualityOverview}
              onIntent={() => preloadDashboardTab('quality')}
              active={activeTab === 'quality'}
              variant="separatedTab"
            >
              {i18n.t('ui.app.dataQuality')}
              {qualityCount > 0 && (
                <CountBadge
                  tone={
                    hasPipelineError || hasFundValidationError
                      ? 'negative'
                      : 'warning'
                  }
                >
                  <Layout as="span" flow="inline" inset="compact">
                    {qualityCount}
                  </Layout>
                </CountBadge>
              )}
            </NavigationButton>
          </Layout>
        </Inline>
      </Navigation>
    </div>
  )
}

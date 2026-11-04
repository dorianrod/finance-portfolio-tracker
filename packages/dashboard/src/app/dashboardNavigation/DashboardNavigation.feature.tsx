import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'

import { preloadDashboardTab } from '@/app/routing/dashboardTabLoaders/preloadDashboardTab'
import { useQualityNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useQualityNavigation'
import { useQualityAssessmentModel } from '@/domains/portfolio/features/data-quality/features/assessment/services/useQualityAssessmentModel'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { CountBadge } from '@/shared/ui/badge/CountBadge.view'
import { Navigation } from '@/shared/ui/controls/Navigation.view'
import { NavigationButton } from '@/shared/ui/controls/NavigationButton.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

import { PrimaryTabButton } from './PrimaryTabButton.feature'
import { PRIMARY_TABS } from './primaryTabs'

export function DashboardNavigation() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const {
    qualitySummary: { hasFundValidationError, hasPipelineError, qualityCount },
  } = useQualityAssessmentModel()
  const navigateTo = useSetAtom(dashboardActiveTabAtom)
  const { openQualityOverview } = useQualityNavigation()
  const formatNumber = useFormatNumber()

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
                    {formatNumber(qualityCount)}
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

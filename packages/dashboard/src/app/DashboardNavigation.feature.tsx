import { preloadDashboardTab } from '@/app/routing/dashboardTabLoaders'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { useDashboardQuality } from '@/domains/portfolio/shared/services/actions/useDashboardQuality'
import { type AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import i18n from '@/i18n/i18n'
import { CountBadge } from '@/shared/ui/Badge.view'
import { Navigation, NavigationButton } from '@/shared/ui/Controls.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'

const PRIMARY_TABS: Array<{
  id: Exclude<AnalysisTab, 'quality'>
  label: string
}> = [
  { id: 'overview', label: i18n.t('ui.app.overview') },
  { id: 'wealth', label: i18n.t('ui.app.wealthCashFlow') },
  { id: 'performance', label: i18n.t('ui.app.performancePassiveIncome') },
  { id: 'allocation', label: i18n.t('ui.app.diversification') },
  { id: 'holdings', label: i18n.t('ui.app.holdings') },
]

export type PrimaryTabButtonProps = {
  activeTab: AnalysisTab
  onNavigate: (tab: AnalysisTab) => void
  tab: (typeof PRIMARY_TABS)[number]
}

export function PrimaryTabButton({
  activeTab,
  onNavigate,
  tab,
}: PrimaryTabButtonProps) {
  return (
    <Layout as="span" flow="control" sizing="fixed">
      <NavigationButton
        type="button"
        onClick={() => onNavigate(tab.id)}
        onIntent={() => preloadDashboardTab(tab.id)}
        active={activeTab === tab.id}
        variant="tab"
      >
        {tab.label}
      </NavigationButton>
    </Layout>
  )
}

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
  const { openQualityOverview } = useDashboardQuality()

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

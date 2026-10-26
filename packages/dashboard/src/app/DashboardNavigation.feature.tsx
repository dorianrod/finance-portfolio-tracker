import { preloadDashboardTab } from '@/app/routing/dashboardTabLoaders'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { useDashboardQuality } from '@/domains/portfolio/shared/services/actions/useDashboardQuality'
import { type AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import i18n from '@/i18n/i18n'
import { CountBadge } from '@/shared/ui/Badge.view'
import { Navigation, NavigationButton } from '@/shared/ui/Controls.view'

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
    <NavigationButton
      type="button"
      onClick={() => onNavigate(tab.id)}
      onIntent={() => preloadDashboardTab(tab.id)}
      active={activeTab === tab.id}
      variant="tab"
      className="shrink-0 px-3 py-2.5"
    >
      {tab.label}
    </NavigationButton>
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
    <Navigation
      variant="tabs"
      className="mb-5 flex overflow-x-auto"
      label={i18n.t('ui.app.portfolioAnalyses')}
    >
      {PRIMARY_TABS.map((tab) => (
        <PrimaryTabButton
          key={tab.id}
          activeTab={activeTab}
          onNavigate={navigateTo}
          tab={tab}
        />
      ))}
      <NavigationButton
        type="button"
        onClick={openQualityOverview}
        onIntent={() => preloadDashboardTab('quality')}
        active={activeTab === 'quality'}
        variant="separatedTab"
        className="ml-auto flex shrink-0 items-center gap-2 px-3 py-2.5"
      >
        {i18n.t('ui.app.dataQuality')}
        {qualityCount > 0 && (
          <CountBadge
            tone={
              hasPipelineError || hasFundValidationError
                ? 'negative'
                : 'warning'
            }
            className="px-1.5 py-0.5"
          >
            {qualityCount}
          </CountBadge>
        )}
      </NavigationButton>
    </Navigation>
  )
}

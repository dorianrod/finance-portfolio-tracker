import { preloadDashboardTab } from '@/app/routing/dashboardTabLoaders'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { useDashboardQuality } from '@/domains/portfolio/shared/services/actions/useDashboardQuality'
import { type AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import i18n from '@/i18n/i18n'
import { SEMANTIC_STATUS_BADGE_CLASSES } from '@/shared/theme/semanticColors'
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
      className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-accent text-content' : 'border-transparent text-content-subtle hover:text-content-secondary'}`}
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
      className="mb-5 flex overflow-x-auto border-b border-border"
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
        className={`ml-auto flex shrink-0 items-center gap-2 border-b-2 border-l border-l-border px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'quality' ? 'border-b-accent text-content' : 'border-b-transparent text-content-subtle hover:text-content-secondary'}`}
      >
        {i18n.t('ui.app.dataQuality')}
        {qualityCount > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${hasPipelineError || hasFundValidationError ? SEMANTIC_STATUS_BADGE_CLASSES.critical : SEMANTIC_STATUS_BADGE_CLASSES.warning}`}
          >
            {qualityCount}
          </span>
        )}
      </NavigationButton>
    </Navigation>
  )
}

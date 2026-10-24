import { preloadDashboardTab } from '@/app/services/dashboardTabLoaders'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { useDashboardQuality } from '@/domains/portfolio/shared/services/actions/useDashboardQuality'
import { type AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import i18n from '@/i18n/i18n'
import { SEMANTIC_STATUS_BADGE_CLASSES } from '@/shared/theme/semanticColors'

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
    <button
      type="button"
      onClick={() => onNavigate(tab.id)}
      onMouseEnter={() => preloadDashboardTab(tab.id)}
      onFocus={() => preloadDashboardTab(tab.id)}
      aria-current={activeTab === tab.id ? 'page' : undefined}
      className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-accent text-content' : 'border-transparent text-content-subtle hover:text-content-secondary'}`}
    >
      {tab.label}
    </button>
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
    <nav
      className="mb-5 flex overflow-x-auto border-b border-border"
      aria-label={i18n.t('ui.app.portfolioAnalyses')}
    >
      {PRIMARY_TABS.map((tab) => (
        <PrimaryTabButton
          key={tab.id}
          activeTab={activeTab}
          onNavigate={navigateTo}
          tab={tab}
        />
      ))}
      <button
        type="button"
        onClick={openQualityOverview}
        onMouseEnter={() => preloadDashboardTab('quality')}
        onFocus={() => preloadDashboardTab('quality')}
        aria-current={activeTab === 'quality' ? 'page' : undefined}
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
      </button>
    </nav>
  )
}

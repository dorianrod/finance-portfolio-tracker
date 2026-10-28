import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

import type { PRIMARY_TABS } from './primaryTabs'

export type PrimaryTabButtonProps = {
  activeTab: AnalysisTab
  onNavigate: (tab: AnalysisTab) => void
  tab: (typeof PRIMARY_TABS)[number]
}

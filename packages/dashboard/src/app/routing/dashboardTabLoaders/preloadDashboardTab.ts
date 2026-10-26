import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

import { DASHBOARD_TAB_LOADERS } from './dashboardTabLoaders'

export function preloadDashboardTab(tab: AnalysisTab) {
  void DASHBOARD_TAB_LOADERS[tab]()
}

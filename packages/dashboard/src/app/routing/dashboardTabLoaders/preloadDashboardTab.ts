import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

import { DASHBOARD_TAB_LOADERS } from './dashboardTabLoaders'

export function preloadDashboardTab(tab: AnalysisTab) {
  DASHBOARD_TAB_LOADERS[tab]().catch(() => {
    // Navigation owns the error UI if this speculative download fails.
  })
}

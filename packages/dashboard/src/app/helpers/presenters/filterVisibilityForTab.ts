import type { FilterVisibility } from '@/domains/portfolio/features/scope-selection/types/portfolioFilterPresentation.type'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'
import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'

export function filterVisibilityForTab(
  tab: AnalysisTab,
  holdingsView: HoldingsView = 'positions',
): FilterVisibility {
  const positionsView = tab === 'holdings' && holdingsView === 'positions'
  return {
    showPeriod: true,
    showPositionFilters: positionsView,
  }
}

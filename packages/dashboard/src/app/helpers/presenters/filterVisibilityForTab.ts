import type { FilterVisibility } from '@/domains/portfolio/features/scope-selection/helpers/filters/portfolioFilters.types'

export function filterVisibilityForTab(
  tab: string,
  holdingsView: 'positions' | 'underlying' = 'positions',
): FilterVisibility {
  const positionsView =
    tab === 'positions' || (tab === 'holdings' && holdingsView === 'positions')
  return {
    showPeriod: true,
    showPositionFilters: positionsView,
  }
}

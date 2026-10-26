import type { FilterVisibility } from './portfolioFilters.types'

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

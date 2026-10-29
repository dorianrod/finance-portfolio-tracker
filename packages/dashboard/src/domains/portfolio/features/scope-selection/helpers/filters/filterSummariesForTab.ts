import type { FilterSummaryItem } from '@/domains/portfolio/features/scope-selection/helpers/filters/portfolioFilters.types'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

export function filterSummariesForTab(
  summaries: FilterSummaryItem[],
  tab: AnalysisTab,
): FilterSummaryItem[] {
  return tab === 'overview'
    ? summaries.filter((item) => item.key !== 'period')
    : summaries
}

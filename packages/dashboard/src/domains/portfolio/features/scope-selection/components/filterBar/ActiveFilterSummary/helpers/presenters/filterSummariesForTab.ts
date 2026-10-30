import type { FilterSummaryItem } from '@/domains/portfolio/features/scope-selection/types/portfolioFilterPresentation.type'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

export function filterSummariesForTab(
  summaries: FilterSummaryItem[],
  tab: AnalysisTab,
): FilterSummaryItem[] {
  return tab === 'overview'
    ? summaries.filter((item) => item.key !== 'period')
    : summaries
}

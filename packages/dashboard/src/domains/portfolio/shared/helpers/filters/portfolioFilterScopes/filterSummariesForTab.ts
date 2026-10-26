import type { FilterSummaryItem } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/portfolioFilters.types'

export function filterSummariesForTab(
  summaries: FilterSummaryItem[],
  tab: string,
): FilterSummaryItem[] {
  return tab === 'overview'
    ? summaries.filter((item) => item.key !== 'period')
    : summaries
}

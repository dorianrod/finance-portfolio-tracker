import { normalizeAccountSelection } from '@/domains/portfolio/apis/queries/useFilteredPortfolioHistory'
import { rawAccountId } from '@/domains/portfolio/helpers/filters/accountFilter'
import type { Filters } from '@/domains/portfolio/types/filters'
import type { FilterSummaryItem } from '@/domains/portfolio/components/filters/helpers/filters/portfolioFilters'

export function withoutOperationAndPeriodFilters(filters: Filters): Filters {
  return {
    ...filters,
    operationTypes: new Set<string>(),
    hideClosedPositions: false,
    dateFrom: undefined,
    dateTo: undefined,
  }
}

export function withoutOperationFilters(filters: Filters): Filters {
  return {
    ...filters,
    operationTypes: new Set<string>(),
    hideClosedPositions: false,
  }
}

export function buildDemoPresetSelection(
  allAccounts: string[],
  demoPresetAccounts?: string[] | null,
): Set<string> | null {
  if (!demoPresetAccounts) return null
  const included = new Set(demoPresetAccounts)
  return new Set(
    allAccounts.filter((account) => included.has(rawAccountId(account))),
  )
}

export function isDemoPresetActive(
  selectedAccounts: Set<string>,
  demoPresetAccounts?: string[] | null,
): boolean {
  if (!demoPresetAccounts) return false
  const selected = normalizeAccountSelection(selectedAccounts)
  return selected.length === demoPresetAccounts.length
    && selected.every((account, index) => account === demoPresetAccounts[index])
}

export function filterSummariesForTab(
  summaries: FilterSummaryItem[],
  tab: string,
): FilterSummaryItem[] {
  return tab === 'overview'
    ? summaries.filter((item) => item.key !== 'period')
    : summaries
}

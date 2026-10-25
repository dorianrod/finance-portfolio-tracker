import type { FilterSummaryItem } from '@/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters'
import { rawAccountId } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'

export function withoutOperationAndPeriodFilters(
  filters: DashboardFilters,
): DashboardFilters {
  return {
    ...filters,
    operationTypes: new Set<OperationType>(),
    hideClosedPositions: false,
    dateFrom: undefined,
    dateTo: undefined,
  }
}

export function withoutOperationFilters(
  filters: DashboardFilters,
): DashboardFilters {
  return {
    ...filters,
    operationTypes: new Set<OperationType>(),
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
  return (
    selected.length === demoPresetAccounts.length &&
    selected.every((account, index) => account === demoPresetAccounts[index])
  )
}

export function filterSummariesForTab(
  summaries: FilterSummaryItem[],
  tab: string,
): FilterSummaryItem[] {
  return tab === 'overview'
    ? summaries.filter((item) => item.key !== 'period')
    : summaries
}

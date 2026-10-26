import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

import type { FilterSummaryKey } from './portfolioFilters.types'

export function clearFilterGroup(
  filters: DashboardFilters,
  key: FilterSummaryKey,
): DashboardFilters {
  if (key === 'accounts')
    return { ...filters, accounts: new Set(), accountTypes: new Set() }
  if (key === 'period')
    return { ...filters, dateFrom: undefined, dateTo: undefined }
  if (key === 'operations') return { ...filters, operationTypes: new Set() }
  return { ...filters, hideClosedPositions: true }
}

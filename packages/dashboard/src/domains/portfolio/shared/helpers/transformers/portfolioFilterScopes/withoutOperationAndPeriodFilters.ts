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

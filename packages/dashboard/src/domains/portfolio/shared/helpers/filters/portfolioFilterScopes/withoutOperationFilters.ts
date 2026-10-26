import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'

export function withoutOperationFilters(
  filters: DashboardFilters,
): DashboardFilters {
  return {
    ...filters,
    operationTypes: new Set<OperationType>(),
    hideClosedPositions: false,
  }
}

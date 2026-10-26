import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'

export function resetFilters(): DashboardFilters {
  return {
    accountTypes: new Set<string>(),
    accounts: new Set<string>(),
    operationTypes: new Set<OperationType>(),
    hideClosedPositions: true,
  }
}

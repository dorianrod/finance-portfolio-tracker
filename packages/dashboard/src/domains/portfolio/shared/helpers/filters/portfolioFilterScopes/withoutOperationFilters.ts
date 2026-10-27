// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this common position snapshot and account scope to holdings, wealth, performance and quality. See SHARED_OWNERSHIP_AUDIT.md.
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

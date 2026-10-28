import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export function baseFilters(
  overrides: Partial<DashboardFilters> = {},
): DashboardFilters {
  return {
    accountTypes: new Set(),
    accounts: new Set(),
    operationTypes: new Set(),
    hideClosedPositions: false,
    ...overrides,
  }
}

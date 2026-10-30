import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  accountTypes: new Set(),
  accounts: new Set(),
  operationTypes: new Set(),
  hideClosedPositions: true,
}

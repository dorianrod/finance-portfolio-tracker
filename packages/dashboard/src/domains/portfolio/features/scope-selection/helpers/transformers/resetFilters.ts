import { DEFAULT_DASHBOARD_FILTERS } from '@/domains/portfolio/shared/helpers/transformers/portfolioFilters/defaultDashboardFilters'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export function resetFilters(): DashboardFilters {
  return {
    ...DEFAULT_DASHBOARD_FILTERS,
    accountTypes: new Set(DEFAULT_DASHBOARD_FILTERS.accountTypes),
    accounts: new Set(DEFAULT_DASHBOARD_FILTERS.accounts),
    operationTypes: new Set(DEFAULT_DASHBOARD_FILTERS.operationTypes),
  }
}

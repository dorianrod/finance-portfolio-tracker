import type { DashboardFilters } from './dashboardFilters.type'

export type FilterScopeContext = {
  filters: DashboardFilters
  accountLabels: Record<string, string>
}

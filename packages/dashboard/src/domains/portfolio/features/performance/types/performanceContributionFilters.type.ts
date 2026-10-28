import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export type PerformanceContributionFilters = Pick<
  DashboardFilters,
  'accounts' | 'accountTypes'
>

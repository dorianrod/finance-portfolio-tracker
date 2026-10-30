import { baseFilters as baseFixture } from '@/domains/portfolio/shared/mocks/dashboardFilters.mock'
import type { DashboardFilters } from '@/domains/portfolio/shared/types/dashboardFilters.type'

export function filters(
  overrides: Partial<DashboardFilters> = {},
): DashboardFilters {
  return baseFixture({ hideClosedPositions: true, ...overrides })
}

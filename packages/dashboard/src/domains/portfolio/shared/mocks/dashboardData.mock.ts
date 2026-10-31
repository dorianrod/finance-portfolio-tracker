import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'

export function makeDashboardData(
  overrides: Partial<DashboardData> = {},
): DashboardData {
  return {
    accountLabels: {},
    positions: [],
    rawOperations: [],
    rawPositions: [],
    ...overrides,
  }
}

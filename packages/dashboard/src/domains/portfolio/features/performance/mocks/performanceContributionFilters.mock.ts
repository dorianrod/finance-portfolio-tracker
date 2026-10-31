import type { PerformanceContributionFilters } from '@/domains/portfolio/features/performance/types/performanceContributionFilters.type'

export function makePerformanceContributionFilters(
  overrides: Partial<PerformanceContributionFilters> = {},
): PerformanceContributionFilters {
  return {
    accounts: new Set<string>(),
    accountTypes: new Set<string>(),
    ...overrides,
  }
}

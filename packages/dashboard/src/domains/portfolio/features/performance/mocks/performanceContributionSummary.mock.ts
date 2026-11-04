import type { PerformanceContributionSummary } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'

export function createPerformanceContributionSummary(
  overrides: Partial<PerformanceContributionSummary> = {},
): PerformanceContributionSummary {
  return {
    horizon: 'since-tracking',
    available: true,
    startDate: new Date('2022-01-31'),
    endDate: new Date('2026-01-31'),
    netContribution: 100,
    positiveTotal: 100,
    negativeTotal: 0,
    contributors: [],
    detractors: [],
    ...overrides,
  }
}

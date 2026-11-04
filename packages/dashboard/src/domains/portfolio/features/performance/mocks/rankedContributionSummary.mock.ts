import type { PerformanceContributionSummary } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'

export function summary(
  overrides: Partial<PerformanceContributionSummary> = {},
): PerformanceContributionSummary {
  return {
    horizon: 'since-tracking',
    available: true,
    startDate: new Date('2021-01-31'),
    endDate: new Date('2026-10-12'),
    netContribution: 750,
    positiveTotal: 1000,
    negativeTotal: 250,
    contributors: [
      {
        key: 'a',
        label: 'AAA',
        name: 'Asset A',
        amount: 1000,
        share: 100,
        accounts: ['PEA'],
      },
    ],
    detractors: [
      {
        key: 'b',
        label: 'BBB',
        name: 'Asset B',
        amount: -250,
        share: 100,
        accounts: ['CTO'],
      },
    ],
    ...overrides,
  }
}

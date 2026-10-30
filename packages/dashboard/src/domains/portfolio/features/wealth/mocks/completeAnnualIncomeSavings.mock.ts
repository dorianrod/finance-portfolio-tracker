import { makeAnnualIncomeSavingsPoint as baseFixture } from '@/domains/portfolio/features/wealth/mocks/annualIncomeSavingsPoint.mock'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'

export function point(
  overrides: Partial<AnnualIncomeSavingsPoint>,
): AnnualIncomeSavingsPoint {
  return baseFixture({
    year: 2024,
    netSalary: 50000,
    otherIncome: 10000,
    totalIncome: 60000,
    grossSalary: 75000,
    placedSavings: 30000,
    savingsThrough: new Date('2024-12-31'),
    savingsStatus: 'complete',
    placementRate: 50,
    unplacedIncomeProxy: 30000,
    ...overrides,
  })
}

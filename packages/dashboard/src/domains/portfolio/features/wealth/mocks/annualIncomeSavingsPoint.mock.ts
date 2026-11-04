import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'

export function makeAnnualIncomeSavingsPoint(
  overrides: Partial<AnnualIncomeSavingsPoint> = {},
): AnnualIncomeSavingsPoint {
  return {
    year: 2026,
    incomeStatus: 'actual',
    netSalary: 30000,
    otherIncome: 2000,
    totalIncome: 32000,
    grossSalary: 40000,
    placedSavings: 10000,
    savingsThrough: new Date('2026-09-30T00:00:00Z'),
    savingsStatus: 'partial',
    placementRate: 31.25,
    unplacedIncomeProxy: 22000,
    comparable: true,
    ...overrides,
  }
}

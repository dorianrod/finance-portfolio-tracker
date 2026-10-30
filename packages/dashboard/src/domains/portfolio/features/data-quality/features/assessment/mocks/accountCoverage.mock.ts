import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'

export function makeAccountCoverage(
  overrides: Partial<AccountCoverage> = {},
): AccountCoverage {
  return {
    account: 'Brokerage',
    allocated: 1_000,
    unallocated: 0,
    notApplicable: 0,
    ...overrides,
  }
}

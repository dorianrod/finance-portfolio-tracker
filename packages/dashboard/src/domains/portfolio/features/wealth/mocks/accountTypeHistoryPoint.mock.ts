import type { AccountTypeHistoryPoint } from '@/domains/portfolio/features/wealth/types/accountTypeHistory.type'

export function makeAccountTypeHistoryPoint(
  overrides: Partial<AccountTypeHistoryPoint> = {},
): AccountTypeHistoryPoint {
  return {
    date: new Date('2026-01-31'),
    values: { Brokerage: 1, Savings: 2 },
    ...overrides,
  }
}

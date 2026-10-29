import type { MonthlyOperation } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'

export function makeMonthlyOperation(
  overrides: Partial<MonthlyOperation> = {},
): MonthlyOperation {
  return {
    date: new Date('2026-01-15'),
    account: 'Main account',
    operation_type: 'DEPOSIT',
    total_amount: 100,
    ...overrides,
  }
}

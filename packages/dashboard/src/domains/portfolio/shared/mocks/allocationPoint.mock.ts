import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'

export function makeAllocationPoint(
  overrides: Partial<AllocationPoint> = {},
): AllocationPoint {
  return {
    date: new Date('2026-01-31T00:00:00Z'),
    categories: [{ name: 'Equity', value: 100 }],
    ...overrides,
  }
}

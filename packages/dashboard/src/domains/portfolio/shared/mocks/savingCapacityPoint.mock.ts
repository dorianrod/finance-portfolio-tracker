import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function makeSavingCapacityPoint(
  overrides: Partial<SavingCapacityPoint> = {},
): SavingCapacityPoint {
  return {
    date: new Date('2025-01-31'),
    savings_delta: 100,
    perf_delta: 20,
    ...overrides,
  }
}

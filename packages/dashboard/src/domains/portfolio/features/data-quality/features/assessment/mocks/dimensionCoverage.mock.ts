import type { DimensionCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/dimensionCoverage.type'

export function makeDimensionCoverage(
  overrides: Partial<DimensionCoverage> = {},
): DimensionCoverage {
  return {
    dimension: 'geo',
    allocated: 1_000,
    unallocated: 0,
    issues: [],
    ...overrides,
  }
}

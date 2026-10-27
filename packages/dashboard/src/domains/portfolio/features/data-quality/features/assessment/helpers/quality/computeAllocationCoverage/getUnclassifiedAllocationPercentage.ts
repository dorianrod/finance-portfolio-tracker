import type { DimensionCoverage } from './computeAllocationCoverage.types'

export function getUnclassifiedAllocationPercentage({
  allocated,
  unallocated,
}: Pick<DimensionCoverage, 'allocated' | 'unallocated'>): number {
  const total = allocated + unallocated
  return total > 0 ? (unallocated / total) * 100 : 0
}

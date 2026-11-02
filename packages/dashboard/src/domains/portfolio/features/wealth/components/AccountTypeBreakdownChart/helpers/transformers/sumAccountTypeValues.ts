import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

export function sumAccountTypeValues(
  points: readonly AccountTypePoint[],
): number {
  return points.reduce((sum, point) => sum + point.total_value, 0)
}

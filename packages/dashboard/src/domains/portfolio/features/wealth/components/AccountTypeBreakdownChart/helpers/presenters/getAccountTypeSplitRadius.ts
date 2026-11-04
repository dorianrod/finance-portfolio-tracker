import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

export function getAccountTypeSplitRadius(
  point: Pick<AccountTypePoint, 'unrealized_gain' | 'total_cost_basis'>,
  radius: number,
): number {
  if (point.unrealized_gain < 0) {
    const lossRatio =
      point.total_cost_basis > 0
        ? Math.min(
            Math.abs(point.unrealized_gain) / point.total_cost_basis,
            0.95,
          )
        : 1
    return radius * Math.sqrt(1 - lossRatio)
  }

  const positiveTotal = point.total_cost_basis + point.unrealized_gain
  const costRatio =
    positiveTotal > 0 ? Math.min(point.total_cost_basis / positiveTotal, 1) : 0
  return radius * Math.sqrt(costRatio)
}

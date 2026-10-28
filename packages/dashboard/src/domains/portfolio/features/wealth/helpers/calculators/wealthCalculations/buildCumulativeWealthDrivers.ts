import type { WealthDriverPoint } from '@/domains/portfolio/features/wealth/types/wealthDriverPoint.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function buildCumulativeWealthDrivers(
  points: SavingCapacityPoint[],
): WealthDriverPoint[] {
  let cumulativeSavings = 0
  let cumulativePerformance = 0

  return points.map((point) => {
    cumulativeSavings += point.savings_delta
    cumulativePerformance += point.perf_delta
    return {
      ...point,
      cumulative_savings: Math.round(cumulativeSavings),
      cumulative_performance: Math.round(cumulativePerformance),
      cumulative_change: Math.round(cumulativeSavings + cumulativePerformance),
    }
  })
}

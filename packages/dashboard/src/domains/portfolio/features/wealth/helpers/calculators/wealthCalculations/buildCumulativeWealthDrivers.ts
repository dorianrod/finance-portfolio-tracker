import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

import type { WealthDriverPoint } from './wealthCalculations.types'

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

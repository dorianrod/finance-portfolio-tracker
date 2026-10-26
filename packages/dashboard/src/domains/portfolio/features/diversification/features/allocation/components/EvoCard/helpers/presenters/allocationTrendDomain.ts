import { dateTimestamp } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/dateTimestamp'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'

export function allocationTrendDomain(
  points: AllocationPoint[],
): [number, number] {
  const firstPoint = dateTimestamp(points[0]?.date)
  const lastPoint = dateTimestamp(points.at(-1)?.date)
  const start = firstPoint ?? 0
  const end = lastPoint ?? start
  return [start, Math.max(start, end)]
}

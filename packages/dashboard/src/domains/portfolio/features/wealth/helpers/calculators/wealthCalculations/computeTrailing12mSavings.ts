import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/types/trailingSavingCapacityPoint.type'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/selectors/filterPointsByPeriod'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

// Last 12 months of savings capacity, each enriched with its own trailing
// 12-month rolling sums (computed from the full history, not just the
// truncated slice).
export function computeTrailing12mSavings(
  savingCapacity: SavingCapacityPoint[],
  dateFrom?: Date,
  dateTo?: Date,
): TrailingSavingCapacityPoint[] {
  const enriched = savingCapacity.map((pt, fullIdx) => {
    const window = savingCapacity.slice(Math.max(0, fullIdx - 11), fullIdx + 1)
    const rolling_12m = Math.round(
      window.reduce((sum, p) => sum + p.savings_delta, 0),
    )
    const rolling_perf_12m = Math.round(
      window.reduce((sum, p) => sum + p.perf_delta, 0),
    )
    return { ...pt, rolling_12m, rolling_perf_12m }
  })
  const visible = filterPointsByPeriod(enriched, dateFrom, dateTo)
  return dateFrom || dateTo ? visible : visible.slice(-12)
}

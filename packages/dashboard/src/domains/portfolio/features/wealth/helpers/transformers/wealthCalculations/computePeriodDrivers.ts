import type { PeriodDrivers } from '@/domains/portfolio/features/wealth/types/periodDrivers.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function computePeriodDrivers(
  points: SavingCapacityPoint[],
): PeriodDrivers {
  const savings = points.reduce((sum, point) => sum + point.savings_delta, 0)
  const performance = points.reduce((sum, point) => sum + point.perf_delta, 0)
  return {
    savings: Math.round(savings),
    performance: Math.round(performance),
    change: Math.round(savings + performance),
  }
}

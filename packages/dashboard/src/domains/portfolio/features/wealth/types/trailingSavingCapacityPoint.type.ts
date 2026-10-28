import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export type TrailingSavingCapacityPoint = SavingCapacityPoint & {
  rolling_12m: number
  rolling_perf_12m: number
}

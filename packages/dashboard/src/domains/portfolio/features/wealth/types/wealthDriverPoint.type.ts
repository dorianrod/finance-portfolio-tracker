import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export type WealthDriverPoint = SavingCapacityPoint & {
  cumulative_savings: number
  cumulative_performance: number
  cumulative_change: number
}

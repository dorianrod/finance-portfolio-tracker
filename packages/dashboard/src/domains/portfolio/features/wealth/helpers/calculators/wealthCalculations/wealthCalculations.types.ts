import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export type TrailingSavingCapacityPoint = SavingCapacityPoint & {
  rolling_12m: number
  rolling_perf_12m: number
}

export type WealthDriverPoint = SavingCapacityPoint & {
  cumulative_savings: number
  cumulative_performance: number
  cumulative_change: number
}

export type PeriodDrivers = {
  savings: number
  performance: number
  change: number
}

export type YearOverYearMetric = {
  current: number | null
  previous: number | null
  changePct: number | null
}

export type TrailingYearOverYear = {
  currentMonths: string[]
  comparisonMonths: string[]
  savings: YearOverYearMetric
  performance: YearOverYearMetric
}

import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import { filterPointsByPeriod } from '@/domains/portfolio/shared/helpers/filters/filterPointsByPeriod'
import type {
  MonthlyOperation,
  MonthlyOperationsByMonth,
} from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

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

export function computeTrailing12mYearOverYear(
  points: SavingCapacityPoint[],
  asOfDate?: Date,
): TrailingYearOverYear {
  const byMonth = new Map<string, { savings: number; performance: number }>()
  for (const point of points) {
    if (asOfDate && point.date > asOfDate) continue
    const month = toCalendarMonth(point.date)
    const totals = byMonth.get(month) ?? { savings: 0, performance: 0 }
    totals.savings += point.savings_delta
    totals.performance += point.perf_delta
    byMonth.set(month, totals)
  }

  const latestMonth = [...byMonth.keys()].toSorted().at(-1)
  if (!latestMonth) {
    const emptyMetric = { current: null, previous: null, changePct: null }
    return {
      currentMonths: [],
      comparisonMonths: [],
      savings: emptyMetric,
      performance: { ...emptyMetric },
    }
  }

  const currentMonths = Array.from({ length: 12 }, (_, index) =>
    shiftMonth(latestMonth, index - 11),
  )
  const comparisonMonths = currentMonths.map((month) => shiftMonth(month, -12))

  const metric = (key: 'savings' | 'performance'): YearOverYearMetric => {
    const current = currentMonths.every((month) => byMonth.has(month))
      ? currentMonths.reduce((sum, month) => sum + byMonth.get(month)![key], 0)
      : null
    const previous = comparisonMonths.every((month) => byMonth.has(month))
      ? comparisonMonths.reduce(
          (sum, month) => sum + byMonth.get(month)![key],
          0,
        )
      : null
    let changePct: number | null = null
    if (current === 0 && previous === 0) changePct = 0
    else if (current != null && previous != null && previous !== 0) {
      changePct = ((current - previous) / Math.abs(previous)) * 100
    }

    return { current, previous, changePct }
  }

  return {
    currentMonths,
    comparisonMonths,
    savings: metric('savings'),
    performance: metric('performance'),
  }
}

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

export function filterMonthlyOpsByAccounts(
  allOps: MonthlyOperationsByMonth,
  accounts?: Set<string>,
): MonthlyOperationsByMonth {
  if (!accounts || accounts.size === 0) return allOps
  const rawAccounts = rawAccountSet(accounts)
  return new Map<string, MonthlyOperation[]>(
    [...allOps.entries()].map(([month, list]) => [
      month,
      list.filter((o) => rawAccounts?.has(o.account)),
    ]),
  )
}

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

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
  return shifted.toISOString().slice(0, 7)
}

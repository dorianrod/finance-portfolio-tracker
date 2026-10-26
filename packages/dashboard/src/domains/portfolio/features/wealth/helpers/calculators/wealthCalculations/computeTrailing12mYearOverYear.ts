import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

import type {
  TrailingYearOverYear,
  YearOverYearMetric,
} from './wealthCalculations.types'

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

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
  return shifted.toISOString().slice(0, 7)
}

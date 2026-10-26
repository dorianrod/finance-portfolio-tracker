import { addDays } from './addDays'
import type { OverviewWindows } from './buildOverviewComparison.types'
import { DAY_MS } from './dayMs'
import { minDate } from './minDate'
import { shiftYear } from './shiftYear'

export function resolveOverviewWindows(
  availableDates: Date[],
  dateFrom?: Date,
  dateTo?: Date,
): OverviewWindows | null {
  const dates = availableDates.toSorted(
    (left, right) => left.getTime() - right.getTime(),
  )
  const earliest = dates[0]
  const latest = dates.at(-1)
  if (!earliest || !latest) return null

  const currentEnd = dateTo ? minDate(dateTo, latest) : latest
  const defaultedToTrailingYear = !dateFrom && !dateTo
  const currentStart =
    dateFrom ?? (dateTo ? earliest : addDays(shiftYear(currentEnd, -1), 1))
  if (currentStart > currentEnd) return null

  const durationDays =
    Math.round((currentEnd.getTime() - currentStart.getTime()) / DAY_MS) + 1
  const previousEnd = addDays(currentStart, -1)
  const previousStart = addDays(previousEnd, -(durationDays - 1))

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
    defaultedToTrailingYear,
  }
}

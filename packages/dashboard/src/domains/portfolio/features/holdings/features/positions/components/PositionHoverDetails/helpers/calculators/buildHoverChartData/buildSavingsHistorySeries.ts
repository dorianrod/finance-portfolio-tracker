import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

import { computeMonthlyBalances } from './computeMonthlyBalances'

export function buildSavingsHistorySeries(
  history: HistoryPoint[] | null | undefined,
  operations: Parameters<typeof computeMonthlyBalances>[0],
) {
  if (!history?.length) return computeMonthlyBalances(operations)
  return history.map((point, index) => {
    const previous = history[index - 1]
    return {
      month: toCalendarMonth(point.date),
      balance: Math.round(point.value),
      delta: previous ? Math.round(point.value - previous.value) : 0,
    }
  })
}

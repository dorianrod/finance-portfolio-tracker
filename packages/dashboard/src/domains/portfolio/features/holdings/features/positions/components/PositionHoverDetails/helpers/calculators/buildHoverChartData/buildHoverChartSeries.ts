import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'
import type { PositionChartOperation } from '@/domains/portfolio/features/holdings/features/positions/types/positionChartOperation.type'
import { toCalendarMonth } from '@/shared/helpers/mappers/toCalendarMonth'

import type { HoverChartDataPoint } from './buildHoverChartData.types'
import { computeRollingReturns } from './computeRollingReturns'

// Builds one point per month: the position's value/cost-basis/unit-price
// snapshot, plus that month's buy/sell activity (for the dot markers and
// tooltip breakdown).
export function buildHoverChartSeries(
  history: HistoryPoint[],
  operations: PositionChartOperation[],
): HoverChartDataPoint[] {
  const operationsByMonth = new Map<string, PositionChartOperation[]>()
  for (const operation of operations) {
    const month = toCalendarMonth(operation.date)
    const monthlyOperations = operationsByMonth.get(month) ?? []
    monthlyOperations.push(operation)
    operationsByMonth.set(month, monthlyOperations)
  }
  const series = history.map((p) => {
    const month = toCalendarMonth(p.date)
    const monthlyOperations = operationsByMonth.get(month) ?? []
    const buysThisMonth = monthlyOperations.filter(
      (o) => o.operation_type === 'BUY',
    )
    const sellsThisMonth = monthlyOperations.filter(
      (o) => o.operation_type === 'SELL',
    )
    const buyAmount = buysThisMonth.reduce(
      (s, o) => s + Math.abs(o.total_amount),
      0,
    )
    const sellAmount = sellsThisMonth.reduce(
      (s, o) => s + Math.abs(o.total_amount),
      0,
    )
    const sellGain = sellsThisMonth.reduce(
      (s, o) => s + (o.realized_gain ?? 0),
      0,
    )
    return {
      date: month,
      Value: p.value,
      'Cost basis': p.costBasis,
      'Unit price': p.last_price,
      hasBuy: buysThisMonth.length > 0,
      hasSell: sellsThisMonth.length > 0,
      buyAmount: buysThisMonth.length > 0 ? buyAmount : undefined,
      sellAmount: sellsThisMonth.length > 0 ? sellAmount : undefined,
      sellGain: sellsThisMonth.length > 0 ? sellGain : undefined,
      unrealized: p.value - p.costBasis,
    }
  })
  const rollingReturnsByMonth = computeRollingReturns(series)
  return series.map((point) => ({
    ...point,
    rollingReturns: rollingReturnsByMonth.get(point.date) ?? [],
  }))
}

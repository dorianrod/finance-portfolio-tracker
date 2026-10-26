import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import type { IncomeSummary } from './performanceCalculations.types'

export function computeTrailing12mIncome(
  positions: PositionRow[],
  asOfDate?: Date,
): IncomeSummary {
  const operations = positions.flatMap((position) =>
    position.subRows.flatMap((group) => group.subRows),
  )
  const incomeOps = operations.filter(
    (operation) =>
      operation.operation_type === 'DIVIDEND' ||
      operation.operation_type === 'INTEREST',
  )

  if (incomeOps.length === 0 && !asOfDate) {
    return {
      dividends: 0,
      interest: 0,
      total: 0,
      previousTotal: 0,
      changePct: null,
      dateFrom: null,
      dateTo: null,
    }
  }

  const dateTo =
    asOfDate ??
    incomeOps.reduce(
      (latest, operation) =>
        operation.date > latest ? operation.date : latest,
      incomeOps[0].date,
    )
  const dateFrom = shiftDateByYears(dateTo, -1)
  const previousDateFrom = shiftDateByYears(dateTo, -2)

  const trailing = incomeOps.filter(
    (operation) => operation.date > dateFrom && operation.date <= dateTo,
  )
  const previousTrailing = incomeOps.filter(
    (operation) =>
      operation.date > previousDateFrom && operation.date <= dateFrom,
  )
  const dividends = trailing
    .filter((operation) => operation.operation_type === 'DIVIDEND')
    .reduce((sum, operation) => sum + operation.total_amount, 0)
  const interest = trailing
    .filter((operation) => operation.operation_type === 'INTEREST')
    .reduce((sum, operation) => sum + operation.total_amount, 0)
  const previousTotal = previousTrailing.reduce(
    (sum, operation) => sum + operation.total_amount,
    0,
  )
  const total = dividends + interest
  let changePct: number | null = null
  if (previousTotal !== 0)
    changePct = ((total - previousTotal) / Math.abs(previousTotal)) * 100
  else if (total === 0) changePct = 0

  return {
    dividends: Math.round(dividends),
    interest: Math.round(interest),
    total: Math.round(total),
    previousTotal: Math.round(previousTotal),
    changePct,
    dateFrom,
    dateTo,
  }
}

function shiftDateByYears(date: Date, yearOffset: number): Date {
  const targetYear = date.getUTCFullYear() + yearOffset
  const targetMonth = date.getUTCMonth()
  const targetDay = Math.min(
    date.getUTCDate(),
    new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate(),
  )
  return new Date(Date.UTC(targetYear, targetMonth, targetDay))
}

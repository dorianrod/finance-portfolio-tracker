import { resolveAssetName } from '@/domains/portfolio/shared/helpers/mappers/resolveAssetName'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function buildTriChartData(
  history: PortfolioHistoryPoint[],
): TriChartPoint[] {
  if (
    !history.some(
      (point) => point.tri_rolling_1y !== null || point.tri_rolling_3y !== null,
    )
  )
    return []

  const firstOneYearIndex = history.findIndex(
    (point) => point.tri_rolling_1y !== null,
  )
  const firstOneYearValue =
    firstOneYearIndex === -1 ? null : history[firstOneYearIndex].tri_rolling_1y
  const firstThreeYearIndex = history.findIndex(
    (point) => point.tri_rolling_3y !== null,
  )
  const firstThreeYearValue =
    firstThreeYearIndex === -1
      ? null
      : history[firstThreeYearIndex].tri_rolling_3y

  return history.map((point, index) => ({
    ...point,
    tri_rolling_1y_backfill:
      firstOneYearValue !== null && index <= firstOneYearIndex
        ? firstOneYearValue
        : null,
    tri_rolling_3y_backfill:
      firstThreeYearValue !== null && index <= firstThreeYearIndex
        ? firstThreeYearValue
        : null,
  }))
}

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

export function computePerformanceSummary(
  positions: PositionRow[],
): PerformanceSummary {
  const active = positions.filter((position) => position.status === 'active')
  const currentValueGross = active.reduce(
    (sum, position) => sum + (position.total_value ?? 0),
    0,
  )
  const unrealizedGross = active.reduce(
    (sum, position) => sum + (position.unrealized_gain ?? 0),
    0,
  )
  const unrealizedNet = active.reduce(
    (sum, position) =>
      sum + (position.unrealized_gain_net ?? position.unrealized_gain ?? 0),
    0,
  )
  const currentCostBasis = currentValueGross - unrealizedGross
  const currentValueNet = currentCostBasis + unrealizedNet
  const realizedNet = positions.reduce(
    (sum, position) =>
      sum + (position.realized_gain_net ?? position.realized_gain),
    0,
  )
  const incomeNet = positions.reduce(
    (sum, position) =>
      sum +
      (position.total_dividends_net ?? position.total_dividends) +
      (position.total_interest_net ?? position.total_interest),
    0,
  )
  const realizedGross = positions.reduce(
    (sum, position) => sum + position.realized_gain,
    0,
  )
  const incomeGross = positions.reduce(
    (sum, position) => sum + position.total_dividends + position.total_interest,
    0,
  )
  const totalPerformanceGross = unrealizedGross + realizedGross + incomeGross
  const totalPerformanceNet = unrealizedNet + realizedNet + incomeNet
  const totalInvested = positions.reduce(
    (sum, position) => sum + position.total_invested,
    0,
  )

  return {
    currentValueNet: Math.round(currentValueNet),
    currentValueGross: Math.round(currentValueGross),
    unrealizedNet: Math.round(unrealizedNet),
    unrealizedGross: Math.round(unrealizedGross),
    realizedNet: Math.round(realizedNet),
    realizedGross: Math.round(realizedGross),
    incomeNet: Math.round(incomeNet),
    totalPerformanceGross: Math.round(totalPerformanceGross),
    totalPerformanceNet: Math.round(totalPerformanceNet),
    totalPerformancePct:
      totalInvested > 0 ? (totalPerformanceNet / totalInvested) * 100 : 0,
  }
}

// Active positions with non-zero unrealized P&L, sorted best to worst.
export function computeTopPerformers(
  positions?: PositionRow[],
): TopPerformer[] {
  if (!positions) return []
  return positions
    .filter(
      (p) =>
        p.status === 'active' &&
        p.unrealized_gain_pct !== null &&
        p.unrealized_gain_pct !== 0,
    )
    .map((p) => ({
      label: resolveAssetName(p, p.isin),
      name: p.name,
      pct: Math.round(p.unrealized_gain_pct! * 10) / 10,
      gain: Math.round(p.unrealized_gain ?? 0),
      value: Math.round(p.total_value ?? 0),
      account_type: p.account_type ?? '',
    }))
    .toSorted((a, b) => b.pct - a.pct)
}

export type IncomeSummary = {
  dividends: number
  interest: number
  total: number
  previousTotal: number
  changePct: number | null
  dateFrom: Date | null
  dateTo: Date | null
}

export type PerformanceSummary = {
  currentValueNet: number
  currentValueGross: number
  unrealizedNet: number
  unrealizedGross: number
  realizedNet: number
  realizedGross: number
  incomeNet: number
  totalPerformanceGross: number
  totalPerformanceNet: number
  totalPerformancePct: number
}

export type TriChartPoint = PortfolioHistoryPoint & {
  tri_rolling_1y_backfill: number | null
  tri_rolling_3y_backfill: number | null
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

export type TopPerformer = {
  label: string
  name: string
  pct: number
  gain: number
  value: number
  account_type: string
}

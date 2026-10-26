import {
  buildHistoricalConcentration,
  buildHistoricalLookThroughConcentration,
  type HistoricalConcentrationHolding,
  type HistoricalConcentrationPoint,
} from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import {
  accountFilterId,
  CASH_ACCOUNT_FILTER_SUFFIX,
} from '@/domains/portfolio/shared/helpers/filters/accountFilter'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

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

export function buildGrossValueHistory(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): Array<{ date: Date; value: number }> {
  const byDate = new Map<number, number>()
  for (const row of rows) {
    if (
      !row.snapshot_date ||
      !matchesPositionScope(row, accountFilters, accountTypeFilters)
    )
      continue
    const grossValue = row.total_value
    if (grossValue == null || !Number.isFinite(grossValue)) continue
    byDate.set(
      row.snapshot_date.getTime(),
      (byDate.get(row.snapshot_date.getTime()) ?? 0) + grossValue,
    )
  }
  return [...byDate.entries()]
    .toSorted(([left], [right]) => left - right)
    .map(([date, value]) => ({
      date: new Date(date),
      value: Math.round(value),
    }))
}

export function compareRollingThreeYearIrr(
  history: PortfolioHistoryPoint[],
  windows: OverviewWindows,
): ComparedMetric {
  const points = [...history].toSorted(
    (left, right) => left.date.getTime() - right.date.getTime(),
  )
  const current =
    latestAtOrBefore(points, windows.current.end)?.tri_rolling_3y ?? null
  const previous =
    latestAtOrBefore(points, windows.previous.end)?.tri_rolling_3y ?? null
  return compared(current, previous)
}

export function buildOverviewComparison(
  input: OverviewComparisonInput,
): OverviewComparison | null {
  const accountFilters = input.accountFilters ?? new Set<string>()
  const accountTypeFilters = input.accountTypeFilters ?? new Set<string>()
  const valuePoints = buildGrossValueHistory(
    input.rawPositions,
    accountFilters,
    accountTypeFilters,
  )
  const availableDates = [
    ...valuePoints.map((point) => point.date),
    ...input.savingCapacity.map((point) => point.date),
  ]
  const windows = resolveOverviewWindows(
    availableDates,
    input.dateFrom,
    input.dateTo,
  )
  if (!windows) return null

  const currentValue =
    latestAtOrBefore(valuePoints, windows.current.end)?.value ?? null
  const previousValue =
    latestAtOrBefore(valuePoints, windows.previous.end)?.value ?? null
  const currentContributions = sumWindow(
    input.savingCapacity,
    windows.current,
    (point) => point.savings_delta,
  )
  const previousContributions = sumWindow(
    input.savingCapacity,
    windows.previous,
    (point) => point.savings_delta,
  )
  const currentPerformance = sumWindow(
    input.savingCapacity,
    windows.current,
    (point) => point.perf_delta,
  )
  const previousPerformance = sumWindow(
    input.savingCapacity,
    windows.previous,
    (point) => point.perf_delta,
  )

  const heldPoints = buildHistoricalConcentration(
    input.rawPositions,
    accountFilters,
    accountTypeFilters,
  )
  const lookThroughPoints = buildHistoricalLookThroughConcentration(
    input.rawPositions,
    input.fundHoldingsHistory,
    accountFilters,
    accountTypeFilters,
  )

  return {
    windows,
    value: compared(currentValue, previousValue),
    contributions: compared(currentContributions, previousContributions),
    marketPerformance: compared(currentPerformance, previousPerformance),
    passiveIncome: compared(
      incomeInWindow(input.rawOperations, windows.current, accountFilters),
      incomeInWindow(input.rawOperations, windows.previous, accountFilters),
    ),
    valueHistory: valuePoints
      .filter(
        (point) =>
          point.date >= windows.previous.start &&
          point.date <= windows.current.end,
      )
      .map((point) => ({
        ...point,
        window: point.date >= windows.current.start ? 'current' : 'previous',
      })),
    heldConcentration: concentrationComparison(heldPoints, windows),
    lookThroughConcentration: concentrationComparison(
      lookThroughPoints,
      windows,
    ),
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

export type OverviewPeriod = {
  start: Date
  end: Date
}

export type OverviewWindows = {
  current: OverviewPeriod
  previous: OverviewPeriod
  defaultedToTrailingYear: boolean
}

export type ComparedMetric = {
  current: number | null
  previous: number | null
  delta: number | null
  deltaPct: number | null
}

export type OverviewValuePoint = {
  date: Date
  value: number
  window: 'previous' | 'current'
}

export type OverviewConcentrationPoint = {
  date: Date
  topHoldingPct: number
  topFivePct: number
  coveragePct: number
  holdings: HistoricalConcentrationHolding[]
}

export type OverviewConcentrationComparison = {
  current: OverviewConcentrationPoint | null
  previous: OverviewConcentrationPoint | null
  topHolding: ComparedMetric
  topFive: ComparedMetric
}

export type OverviewComparison = {
  windows: OverviewWindows
  value: ComparedMetric
  contributions: ComparedMetric
  marketPerformance: ComparedMetric
  passiveIncome: ComparedMetric
  valueHistory: OverviewValuePoint[]
  heldConcentration: OverviewConcentrationComparison
  lookThroughConcentration: OverviewConcentrationComparison
}

type OverviewComparisonInput = {
  rawPositions: RawPosition[]
  rawOperations: RawOperation[]
  savingCapacity: SavingCapacityPoint[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters?: Set<string>
  accountTypeFilters?: Set<string>
  dateFrom?: Date
  dateTo?: Date
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

function shiftYear(date: Date, offset: number): Date {
  const targetYear = date.getUTCFullYear() + offset
  const month = date.getUTCMonth()
  const day = Math.min(
    date.getUTCDate(),
    new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate(),
  )
  return new Date(Date.UTC(targetYear, month, day))
}

function minDate(left: Date, right: Date): Date {
  return left < right ? left : right
}

function compared(
  current: number | null,
  previous: number | null,
): ComparedMetric {
  if (current == null || previous == null) {
    return { current, previous, delta: null, deltaPct: null }
  }
  const delta = current - previous
  return {
    current,
    previous,
    delta,
    deltaPct: previous === 0 ? null : (delta / Math.abs(previous)) * 100,
  }
}

function matchesPositionScope(
  row: RawPosition,
  accountFilters: Set<string>,
  accountTypeFilters: Set<string>,
): boolean {
  return (
    (accountFilters.size === 0 || accountFilters.has(accountFilterId(row))) &&
    (accountTypeFilters.size === 0 ||
      accountTypeFilters.has(row.account_type ?? ''))
  )
}

function latestAtOrBefore<T extends { date: Date }>(
  points: T[],
  end: Date,
): T | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].date <= end) return points[index]
  }
  return null
}

function sumWindow<T extends { date: Date }>(
  points: T[],
  period: OverviewPeriod,
  value: (point: T) => number,
): number | null {
  const selected = points.filter(
    (point) => point.date >= period.start && point.date <= period.end,
  )
  if (selected.length === 0) return null
  return Math.round(selected.reduce((sum, point) => sum + value(point), 0))
}

function selectedOperationAccounts(
  accountFilters: Set<string>,
): Set<string> | null {
  if (accountFilters.size === 0) return null
  return new Set(
    [...accountFilters].filter(
      (account) => !account.endsWith(CASH_ACCOUNT_FILTER_SUFFIX),
    ),
  )
}

function incomeInWindow(
  operations: RawOperation[],
  period: OverviewPeriod,
  accountFilters: Set<string>,
): number | null {
  const selectedAccounts = selectedOperationAccounts(accountFilters)
  const relevant = operations.filter(
    (operation) =>
      (operation.operation_type === 'DIVIDEND' ||
        operation.operation_type === 'INTEREST') &&
      operation.date >= period.start &&
      operation.date <= period.end &&
      (selectedAccounts === null || selectedAccounts.has(operation.account)),
  )
  if (relevant.length === 0) return 0
  return Math.round(
    relevant.reduce((sum, operation) => {
      const amount = operation.total_amount
      return sum + (Number.isFinite(amount) ? amount : 0)
    }, 0),
  )
}

function toOverviewConcentration(
  point: HistoricalConcentrationPoint | null,
): OverviewConcentrationPoint | null {
  if (!point) return null
  return {
    date: point.date,
    topHoldingPct: point.holdings[0]?.weight ?? 0,
    topFivePct: point.holdings
      .slice(0, 5)
      .reduce((sum, holding) => sum + holding.weight, 0),
    coveragePct: point.coveragePct,
    holdings: point.holdings,
  }
}

function concentrationComparison(
  points: HistoricalConcentrationPoint[],
  windows: OverviewWindows,
): OverviewConcentrationComparison {
  const current = toOverviewConcentration(
    latestAtOrBefore(points, windows.current.end),
  )
  const previous = toOverviewConcentration(
    latestAtOrBefore(points, windows.previous.end),
  )
  return {
    current,
    previous,
    topHolding: compared(
      current?.topHoldingPct ?? null,
      previous?.topHoldingPct ?? null,
    ),
    topFive: compared(
      current?.topFivePct ?? null,
      previous?.topFivePct ?? null,
    ),
  }
}

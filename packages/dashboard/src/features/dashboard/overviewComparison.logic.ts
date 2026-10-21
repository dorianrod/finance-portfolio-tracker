import type { HistoricalFundHolding } from '@/hooks/useFundHoldings'
import type { SavingCapacityPoint } from '@/hooks/useSavingCapacity'
import { CASH_ACCOUNT_FILTER_SUFFIX, accountFilterId } from '@/shared/filters/accountFilter'
import type { RawOperation, RawPosition } from '@/types/domain'
import type { PortfolioHistoryPoint } from '@/types/history'
import {
  buildHistoricalConcentration,
  buildHistoricalLookThroughConcentration,
  type HistoricalConcentrationHolding,
  type HistoricalConcentrationPoint,
} from '@/features/allocation-charts/concentrationTrend.logic'

const DAY_MS = 24 * 60 * 60 * 1000

export interface OverviewPeriod {
  start: string
  end: string
}

export interface OverviewWindows {
  current: OverviewPeriod
  previous: OverviewPeriod
  defaultedToTrailingYear: boolean
}

export interface ComparedMetric {
  current: number | null
  previous: number | null
  delta: number | null
  deltaPct: number | null
}

export interface OverviewValuePoint {
  date: string
  value: number
  window: 'previous' | 'current'
}

export interface OverviewConcentrationPoint {
  date: string
  topHoldingPct: number
  topFivePct: number
  coveragePct: number
  holdings: HistoricalConcentrationHolding[]
}

export interface OverviewConcentrationComparison {
  current: OverviewConcentrationPoint | null
  previous: OverviewConcentrationPoint | null
  topHolding: ComparedMetric
  topFive: ComparedMetric
}

export interface OverviewComparison {
  windows: OverviewWindows
  value: ComparedMetric
  contributions: ComparedMetric
  marketPerformance: ComparedMetric
  passiveIncome: ComparedMetric
  valueHistory: OverviewValuePoint[]
  heldConcentration: OverviewConcentrationComparison
  lookThroughConcentration: OverviewConcentrationComparison
}

interface OverviewComparisonInput {
  rawPositions: RawPosition[]
  rawOperations: RawOperation[]
  savingCapacity: SavingCapacityPoint[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters?: Set<string>
  accountTypeFilters?: Set<string>
  dateFrom?: string
  dateTo?: string
}

function parseDate(date: string): Date {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`)
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: string, days: number): string {
  return formatDate(new Date(parseDate(date).getTime() + days * DAY_MS))
}

function shiftYear(date: string, offset: number): string {
  const source = parseDate(date)
  const targetYear = source.getUTCFullYear() + offset
  const month = source.getUTCMonth()
  const day = Math.min(
    source.getUTCDate(),
    new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate(),
  )
  return formatDate(new Date(Date.UTC(targetYear, month, day)))
}

function minDate(left: string, right: string): string {
  return left < right ? left : right
}

export function resolveOverviewWindows(
  availableDates: string[],
  dateFrom?: string,
  dateTo?: string,
): OverviewWindows | null {
  const dates = availableDates.filter(Boolean).sort()
  const earliest = dates[0]
  const latest = dates.at(-1)
  if (!earliest || !latest) return null

  const currentEnd = dateTo ? minDate(dateTo, latest) : latest
  const defaultedToTrailingYear = !dateFrom && !dateTo
  const currentStart = dateFrom
    ?? (dateTo ? earliest : addDays(shiftYear(currentEnd, -1), 1))
  if (currentStart > currentEnd) return null

  const durationDays = Math.round(
    (parseDate(currentEnd).getTime() - parseDate(currentStart).getTime()) / DAY_MS,
  ) + 1
  const previousEnd = addDays(currentStart, -1)
  const previousStart = addDays(previousEnd, -(durationDays - 1))

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
    defaultedToTrailingYear,
  }
}

function compared(current: number | null, previous: number | null): ComparedMetric {
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
  return (accountFilters.size === 0 || accountFilters.has(accountFilterId(row)))
    && (accountTypeFilters.size === 0 || accountTypeFilters.has(row.account_type ?? ''))
}

export function buildGrossValueHistory(
  rows: RawPosition[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): Array<{ date: string; value: number }> {
  const byDate = new Map<string, number>()
  for (const row of rows) {
    if (!row.snapshot_date || !matchesPositionScope(row, accountFilters, accountTypeFilters)) continue
    const grossValue = Number.parseFloat(row.total_value)
    if (!Number.isFinite(grossValue)) continue
    byDate.set(row.snapshot_date, (byDate.get(row.snapshot_date) ?? 0) + grossValue)
  }
  return [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, value]) => ({ date, value: Math.round(value) }))
}

function latestAtOrBefore<T extends { date: string }>(points: T[], end: string): T | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].date <= end) return points[index]
  }
  return null
}

export function compareRollingThreeYearIrr(
  history: PortfolioHistoryPoint[],
  windows: OverviewWindows,
): ComparedMetric {
  const points = [...history].sort((left, right) => left.date.localeCompare(right.date))
  const current = latestAtOrBefore(points, windows.current.end)?.tri_rolling_3y ?? null
  const previous = latestAtOrBefore(points, windows.previous.end)?.tri_rolling_3y ?? null
  return compared(current, previous)
}

function sumWindow<T extends { date: string }>(
  points: T[],
  period: OverviewPeriod,
  value: (point: T) => number,
): number | null {
  const selected = points.filter((point) => point.date >= period.start && point.date <= period.end)
  if (selected.length === 0) return null
  return Math.round(selected.reduce((sum, point) => sum + value(point), 0))
}

function selectedOperationAccounts(accountFilters: Set<string>): Set<string> | null {
  if (accountFilters.size === 0) return null
  return new Set(
    [...accountFilters]
      .filter((account) => !account.endsWith(CASH_ACCOUNT_FILTER_SUFFIX))
  )
}

function incomeInWindow(
  operations: RawOperation[],
  period: OverviewPeriod,
  accountFilters: Set<string>,
): number | null {
  const selectedAccounts = selectedOperationAccounts(accountFilters)
  const relevant = operations.filter((operation) => (
    (operation.operation_type === 'DIVIDEND' || operation.operation_type === 'INTEREST')
    && operation.date >= period.start
    && operation.date <= period.end
    && (selectedAccounts === null || selectedAccounts.has(operation.account))
  ))
  if (relevant.length === 0) return 0
  return Math.round(relevant.reduce((sum, operation) => {
    const amount = Number.parseFloat(operation.total_amount)
    return sum + (Number.isFinite(amount) ? amount : 0)
  }, 0))
}

function toOverviewConcentration(
  point: HistoricalConcentrationPoint | null,
): OverviewConcentrationPoint | null {
  if (!point) return null
  return {
    date: point.date,
    topHoldingPct: point.holdings[0]?.weight ?? 0,
    topFivePct: point.holdings.slice(0, 5).reduce((sum, holding) => sum + holding.weight, 0),
    coveragePct: point.coveragePct,
    holdings: point.holdings,
  }
}

function concentrationComparison(
  points: HistoricalConcentrationPoint[],
  windows: OverviewWindows,
): OverviewConcentrationComparison {
  const current = toOverviewConcentration(latestAtOrBefore(points, windows.current.end))
  const previous = toOverviewConcentration(latestAtOrBefore(points, windows.previous.end))
  return {
    current,
    previous,
    topHolding: compared(current?.topHoldingPct ?? null, previous?.topHoldingPct ?? null),
    topFive: compared(current?.topFivePct ?? null, previous?.topFivePct ?? null),
  }
}

export function buildOverviewComparison(input: OverviewComparisonInput): OverviewComparison | null {
  const accountFilters = input.accountFilters ?? new Set<string>()
  const accountTypeFilters = input.accountTypeFilters ?? new Set<string>()
  const valuePoints = buildGrossValueHistory(input.rawPositions, accountFilters, accountTypeFilters)
  const availableDates = [
    ...valuePoints.map((point) => point.date),
    ...input.savingCapacity.map((point) => point.date),
  ]
  const windows = resolveOverviewWindows(availableDates, input.dateFrom, input.dateTo)
  if (!windows) return null

  const currentValue = latestAtOrBefore(valuePoints, windows.current.end)?.value ?? null
  const previousValue = latestAtOrBefore(valuePoints, windows.previous.end)?.value ?? null
  const currentContributions = sumWindow(input.savingCapacity, windows.current, (point) => point.savings_delta)
  const previousContributions = sumWindow(input.savingCapacity, windows.previous, (point) => point.savings_delta)
  const currentPerformance = sumWindow(input.savingCapacity, windows.current, (point) => point.perf_delta)
  const previousPerformance = sumWindow(input.savingCapacity, windows.previous, (point) => point.perf_delta)

  const heldPoints = buildHistoricalConcentration(input.rawPositions, accountFilters, accountTypeFilters)
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
      .filter((point) => point.date >= windows.previous.start && point.date <= windows.current.end)
      .map((point) => ({
        ...point,
        window: point.date >= windows.current.start ? 'current' : 'previous',
      })),
    heldConcentration: concentrationComparison(heldPoints, windows),
    lookThroughConcentration: concentrationComparison(lookThroughPoints, windows),
  }
}

import { fmtEur } from '@/shared/format/money'
import type { AccountTypePoint } from '@/types/history'
import type { PortfolioHistoryPoint } from '@/types/history'
import type { PositionRow } from '@/types/domain'
import type { MonthlyOp, MonthlyOpsMap } from '@/hooks/useMonthlyOps'
import type { SavingCapacityPoint } from '@/hooks/useSavingCapacity'
import { rawAccountSet } from '@/shared/filters/accountFilter'
import { assetDisplayLabel } from '@/shared/format/assetLabel'
import type { FundHolding } from '@/hooks/useFundHoldings'

export interface TrailingSavingCapacityPoint extends SavingCapacityPoint {
  rolling_12m: number
  rolling_perf_12m: number
}

export interface WealthDriverPoint extends SavingCapacityPoint {
  cumulative_savings: number
  cumulative_performance: number
  cumulative_change: number
}

export interface PeriodDrivers {
  savings: number
  performance: number
  change: number
}

export interface YearOverYearMetric {
  current: number | null
  previous: number | null
  changePct: number | null
}

export interface TrailingYearOverYear {
  currentMonths: string[]
  comparisonMonths: string[]
  savings: YearOverYearMetric
  performance: YearOverYearMetric
}

export interface IncomeSummary {
  dividends: number
  interest: number
  total: number
  previousTotal: number
  changePct: number | null
  dateFrom: string | null
  dateTo: string | null
}

export interface HoldingConcentration {
  label: string
  name: string
  value: number
  weight: number
}

export interface ConcentrationSummary {
  topHoldingPct: number
  topFivePct: number
  topTenPct: number
  topTenValue: number
  coveragePct: number
  holdings: HoldingConcentration[]
}

export interface PerformanceSummary {
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

export interface TriChartPoint extends PortfolioHistoryPoint {
  tri_rolling_1y_backfill: number | null
  tri_rolling_3y_backfill: number | null
}

export function buildTriChartData(history: PortfolioHistoryPoint[]): TriChartPoint[] {
  if (!history.some((point) => point.tri_rolling_1y !== null || point.tri_rolling_3y !== null)) return []

  const firstOneYearIndex = history.findIndex((point) => point.tri_rolling_1y !== null)
  const firstOneYearValue = firstOneYearIndex === -1
    ? null
    : history[firstOneYearIndex].tri_rolling_1y
  const firstThreeYearIndex = history.findIndex((point) => point.tri_rolling_3y !== null)
  const firstThreeYearValue = firstThreeYearIndex === -1
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

export function filterPointsByPeriod<T extends { date: string }>(
  points: T[],
  dateFrom?: string,
  dateTo?: string,
): T[] {
  return points.filter((point) => {
    if (dateFrom && point.date < dateFrom) return false
    if (dateTo && point.date > dateTo) return false
    return true
  })
}

export function buildCumulativeWealthDrivers(points: SavingCapacityPoint[]): WealthDriverPoint[] {
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

export function computePeriodDrivers(points: SavingCapacityPoint[]): PeriodDrivers {
  const savings = points.reduce((sum, point) => sum + point.savings_delta, 0)
  const performance = points.reduce((sum, point) => sum + point.perf_delta, 0)
  return {
    savings: Math.round(savings),
    performance: Math.round(performance),
    change: Math.round(savings + performance),
  }
}

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
  return shifted.toISOString().slice(0, 7)
}

export function computeTrailing12mYearOverYear(points: SavingCapacityPoint[]): TrailingYearOverYear {
  const byMonth = new Map<string, { savings: number; performance: number }>()
  for (const point of points) {
    const month = point.date.slice(0, 7)
    const totals = byMonth.get(month) ?? { savings: 0, performance: 0 }
    totals.savings += point.savings_delta
    totals.performance += point.perf_delta
    byMonth.set(month, totals)
  }

  const latestMonth = [...byMonth.keys()].sort().at(-1)
  if (!latestMonth) {
    const emptyMetric = { current: null, previous: null, changePct: null }
    return { currentMonths: [], comparisonMonths: [], savings: emptyMetric, performance: { ...emptyMetric } }
  }

  const currentMonths = Array.from({ length: 12 }, (_, index) => shiftMonth(latestMonth, index - 11))
  const comparisonMonths = currentMonths.map((month) => shiftMonth(month, -12))

  const metric = (key: 'savings' | 'performance'): YearOverYearMetric => {
    const current = currentMonths.every((month) => byMonth.has(month))
      ? currentMonths.reduce((sum, month) => sum + byMonth.get(month)![key], 0)
      : null
    const previous = comparisonMonths.every((month) => byMonth.has(month))
      ? comparisonMonths.reduce((sum, month) => sum + byMonth.get(month)![key], 0)
      : null
    const changePct = current == null || previous == null || previous === 0
      ? current === 0 && previous === 0 ? 0 : null
      : ((current - previous) / Math.abs(previous)) * 100

    return { current, previous, changePct }
  }

  return {
    currentMonths,
    comparisonMonths,
    savings: metric('savings'),
    performance: metric('performance'),
  }
}

function shiftDateByYears(dateString: string, yearOffset: number): string {
  const date = new Date(`${dateString.slice(0, 10)}T00:00:00Z`)
  const targetYear = date.getUTCFullYear() + yearOffset
  const targetMonth = date.getUTCMonth()
  const targetDay = Math.min(
    date.getUTCDate(),
    new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate(),
  )
  return new Date(Date.UTC(targetYear, targetMonth, targetDay)).toISOString().slice(0, 10)
}

export function computeTrailing12mIncome(positions: PositionRow[], asOfDate?: string): IncomeSummary {
  const operations = positions.flatMap((position) =>
    position.subRows.flatMap((group) => group.subRows),
  )
  const incomeOps = operations.filter((operation) =>
    operation.operation_type === 'DIVIDEND' || operation.operation_type === 'INTEREST',
  )

  if (incomeOps.length === 0 && !asOfDate) {
    return { dividends: 0, interest: 0, total: 0, previousTotal: 0, changePct: null, dateFrom: null, dateTo: null }
  }

  const dateTo = asOfDate?.slice(0, 10) ?? incomeOps.reduce(
    (latest, operation) => operation.date > latest ? operation.date : latest,
    incomeOps[0].date,
  )
  const dateFrom = shiftDateByYears(dateTo, -1)
  const previousDateFrom = shiftDateByYears(dateTo, -2)

  const trailing = incomeOps.filter((operation) => operation.date > dateFrom && operation.date <= dateTo)
  const previousTrailing = incomeOps.filter(
    (operation) => operation.date > previousDateFrom && operation.date <= dateFrom,
  )
  const dividends = trailing
    .filter((operation) => operation.operation_type === 'DIVIDEND')
    .reduce((sum, operation) => sum + operation.total_amount, 0)
  const interest = trailing
    .filter((operation) => operation.operation_type === 'INTEREST')
    .reduce((sum, operation) => sum + operation.total_amount, 0)
  const previousTotal = previousTrailing.reduce((sum, operation) => sum + operation.total_amount, 0)
  const total = dividends + interest
  const changePct = previousTotal === 0
    ? total === 0 ? 0 : null
    : ((total - previousTotal) / Math.abs(previousTotal)) * 100

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

export function computeConcentration(
  positions: PositionRow[],
  fundHoldings: FundHolding[] = [],
): ConcentrationSummary {
  const byAsset = new Map<string, { label: string; name: string; value: number }>()
  const holdingsByParent = new Map<string, FundHolding[]>()

  for (const holding of fundHoldings) {
    for (const key of [holding.parentIsin, holding.parentTicker].filter(Boolean)) {
      const current = holdingsByParent.get(key) ?? []
      current.push(holding)
      holdingsByParent.set(key, current)
    }
  }

  let selectedValue = 0
  let coveredValue = 0

  function addAsset(key: string, label: string, name: string, value: number) {
    const current = byAsset.get(key) ?? { label, name, value: 0 }
    current.value += value
    byAsset.set(key, current)
  }

  function isFundPosition(position: PositionRow): boolean {
    return /\b(?:ETF|UCITS|FUND)\b/i.test(position.name)
      || /^(?:Amundi|BNP Paribas Easy|Global X|iShares|L&G|Xtrackers)\b/i.test(position.name)
  }

  for (const position of positions) {
    if (position.status !== 'active' || (position.total_value ?? 0) <= 0) continue
    const positionValue = position.total_value ?? 0
    selectedValue += positionValue

    const lookThrough = holdingsByParent.get(position.isin)
      ?? holdingsByParent.get(position.ticker)
    if (lookThrough?.length) {
      // Only the disclosed constituents become concentration candidates.
      // The full fund value remains in the denominator below, so the
      // undisclosed tail cannot be mistaken for one large holding.
      for (const holding of lookThrough) {
        addAsset(
          holding.holdingId,
          holding.holdingName,
          holding.holdingName,
          positionValue * holding.weight,
        )
      }
      coveredValue += positionValue
      continue
    }

    // Rows without a market identifier are account-level valuations (PEE,
    // PER, bank accounts, private-equity envelopes), not underlying assets.
    // Keep them out of the ranking instead of presenting the account as a
    // holding. Identified non-fund securities remain valid direct exposure.
    const key = position.isin || position.ticker
    if (!key || isFundPosition(position)) continue
    addAsset(key, assetDisplayLabel(position, key), position.name, positionValue)
    coveredValue += positionValue
  }

  // `coveredValue` includes the undisclosed tail of mapped funds, producing
  // weights against the full analysable exposure rather than only the top 10.
  const total = coveredValue
  const holdings = [...byAsset.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((holding) => ({
      ...holding,
      value: Math.round(holding.value),
      weight: total > 0 ? (holding.value / total) * 100 : 0,
    }))

  return {
    topHoldingPct: holdings[0]?.weight ?? 0,
    topFivePct: holdings.slice(0, 5).reduce((sum, holding) => sum + holding.weight, 0),
    topTenPct: holdings.reduce((sum, holding) => sum + holding.weight, 0),
    topTenValue: holdings.reduce((sum, holding) => sum + holding.value, 0),
    coveragePct: selectedValue > 0 ? (coveredValue / selectedValue) * 100 : 0,
    holdings,
  }
}

export function computeHeldAssetConcentration(
  positions: PositionRow[],
): ConcentrationSummary {
  const byAsset = new Map<string, { label: string; name: string; value: number }>()

  for (const position of positions) {
    if (position.status !== 'active' || (position.total_value ?? 0) <= 0) continue
    // This is deliberately the allocation-file grain: the instrument or
    // product actually held, aggregated across accounts when its market
    // identifier is shared. Account-valued products fall back to their name.
    const key = position.isin || position.ticker || position.name
    const current = byAsset.get(key) ?? {
      label: assetDisplayLabel(position, key),
      name: position.name,
      value: 0,
    }
    current.value += position.total_value ?? 0
    byAsset.set(key, current)
  }

  const total = [...byAsset.values()].reduce((sum, holding) => sum + holding.value, 0)
  const holdings = [...byAsset.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map((holding) => ({
      ...holding,
      value: Math.round(holding.value),
      weight: total > 0 ? (holding.value / total) * 100 : 0,
    }))

  return {
    topHoldingPct: holdings[0]?.weight ?? 0,
    topFivePct: holdings.slice(0, 5).reduce((sum, holding) => sum + holding.weight, 0),
    topTenPct: holdings.reduce((sum, holding) => sum + holding.weight, 0),
    topTenValue: holdings.reduce((sum, holding) => sum + holding.value, 0),
    coveragePct: total > 0 ? 100 : 0,
    holdings,
  }
}

export function computePerformanceSummary(positions: PositionRow[]): PerformanceSummary {
  const active = positions.filter((position) => position.status === 'active')
  const currentValueGross = active.reduce((sum, position) => sum + (position.total_value ?? 0), 0)
  const unrealizedGross = active.reduce((sum, position) => sum + (position.unrealized_gain ?? 0), 0)
  const unrealizedNet = active.reduce(
    (sum, position) => sum + (position.unrealized_gain_net ?? position.unrealized_gain ?? 0),
    0,
  )
  const currentCostBasis = currentValueGross - unrealizedGross
  const currentValueNet = currentCostBasis + unrealizedNet
  const realizedNet = positions.reduce(
    (sum, position) => sum + (position.realized_gain_net ?? position.realized_gain),
    0,
  )
  const incomeNet = positions.reduce(
    (sum, position) => sum
      + (position.total_dividends_net ?? position.total_dividends)
      + (position.total_interest_net ?? position.total_interest),
    0,
  )
  const realizedGross = positions.reduce((sum, position) => sum + position.realized_gain, 0)
  const incomeGross = positions.reduce(
    (sum, position) => sum + position.total_dividends + position.total_interest,
    0,
  )
  const totalPerformanceGross = unrealizedGross + realizedGross + incomeGross
  const totalPerformanceNet = unrealizedNet + realizedNet + incomeNet
  const totalInvested = positions.reduce((sum, position) => sum + position.total_invested, 0)

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
    totalPerformancePct: totalInvested > 0 ? (totalPerformanceNet / totalInvested) * 100 : 0,
  }
}

// Last 12 months of savings capacity, each enriched with its own trailing
// 12-month rolling sums (computed from the full history, not just the
// truncated slice).
export function computeTrailing12mSavings(savingCapacity: SavingCapacityPoint[]): TrailingSavingCapacityPoint[] {
  return savingCapacity.slice(-12).map((pt, i, arr) => {
    const fullIdx = savingCapacity.length - arr.length + i
    const window = savingCapacity.slice(Math.max(0, fullIdx - 11), fullIdx + 1)
    const rolling_12m = Math.round(window.reduce((sum, p) => sum + p.savings_delta, 0))
    const rolling_perf_12m = Math.round(window.reduce((sum, p) => sum + p.perf_delta, 0))
    return { ...pt, rolling_12m, rolling_perf_12m }
  })
}

export interface TopPerformer {
  label: string
  name: string
  pct: number
  gain: number
  value: number
  account_type: string
}

// Active positions with non-zero unrealized P&L, sorted best to worst.
export function computeTopPerformers(positions?: PositionRow[]): TopPerformer[] {
  if (!positions) return []
  return positions
    .filter((p) => p.status === 'active' && p.unrealized_gain_pct !== null && p.unrealized_gain_pct !== 0)
    .map((p) => ({
      label: assetDisplayLabel(p, p.isin),
      name: p.name,
      pct: Math.round(p.unrealized_gain_pct! * 10) / 10,
      gain: Math.round(p.unrealized_gain ?? 0),
      value: Math.round(p.total_value ?? 0),
      account_type: p.account_type ?? '',
    }))
    .sort((a, b) => b.pct - a.pct)
}

export interface AccountTypePointWithLabel extends AccountTypePoint {
  _label: string
}

export function buildAccountTypeLabels(accountTypeData?: AccountTypePoint[]): AccountTypePointWithLabel[] {
  return (accountTypeData ?? []).map((pt) => {
    const gainPct = pt.total_cost_basis > 0 ? (pt.unrealized_gain / pt.total_cost_basis) * 100 : 0
    return { ...pt, _label: `${fmtEur(pt.total_value)} ${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(0)}%` }
  })
}

export function filterMonthlyOpsByAccounts(allOps: MonthlyOpsMap, accounts?: Set<string>): MonthlyOpsMap {
  if (!accounts || accounts.size === 0) return allOps
  const rawAccounts = rawAccountSet(accounts)
  return new Map<string, MonthlyOp[]>(
    [...allOps.entries()].map(([month, list]) => [
      month,
      list.filter((o) => rawAccounts?.has(o.account)),
    ]),
  )
}

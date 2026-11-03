import { latestAtOrBefore } from '@/domains/portfolio/features/overview/helpers/transformers/latestAtOrBefore'
import { CASH_ACCOUNT_FILTER_SUFFIX } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/cashAccountFilterSuffix'
import { buildHistoricalConcentration } from '@/domains/portfolio/shared/helpers/transformers/buildConcentrationTrend/buildHistoricalConcentration'
import { buildHistoricalLookThroughConcentration } from '@/domains/portfolio/shared/helpers/transformers/buildConcentrationTrend/buildHistoricalLookThroughConcentration'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'
import type { RawOperation } from '@/domains/portfolio/shared/types/rawOperation.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

import { buildGrossValueHistory } from './buildGrossValueHistory'
import { buildNetValueHistory } from './buildNetValueHistory'
import type {
  OverviewComparison,
  OverviewConcentrationComparison,
  OverviewConcentrationPoint,
  OverviewPeriod,
  OverviewWindows,
} from './buildOverviewComparison.types'
import { compared } from './compared'
import { resolveOverviewWindows } from './resolveOverviewWindows'

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

  const netValuePoints = buildNetValueHistory(
    input.rawPositions,
    accountFilters,
    accountTypeFilters,
  )
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
    value: compareValueAtPeriodEnds(valuePoints, windows),
    netValue:
      latestAtOrBefore(netValuePoints, windows.current.end)?.value ?? null,
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

function compareValueAtPeriodEnds(
  points: Array<{ date: Date; value: number | null }>,
  windows: OverviewWindows,
) {
  return compared(
    latestAtOrBefore(points, windows.current.end)?.value ?? null,
    latestAtOrBefore(points, windows.previous.end)?.value ?? null,
  )
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
    topHolding: comparedConcentrationMetric(current, previous, 'topHoldingPct'),
    topFive: comparedConcentrationMetric(current, previous, 'topFivePct'),
  }
}

function comparedConcentrationMetric(
  current: OverviewConcentrationPoint | null,
  previous: OverviewConcentrationPoint | null,
  key: 'topHoldingPct' | 'topFivePct',
) {
  return compared(current?.[key] ?? null, previous?.[key] ?? null)
}

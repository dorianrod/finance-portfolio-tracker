import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'

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
  // The current comparison window may have no usable observation.
  current: number | null
  // The preceding comparison window may have no usable observation.
  previous: number | null
  // A change needs usable observations in both comparison windows.
  delta: number | null
  // A percentage change needs both observations and a nonzero previous value.
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
  // The current comparison window may have no usable observation.
  current: OverviewConcentrationPoint | null
  // The preceding comparison window may have no usable observation.
  previous: OverviewConcentrationPoint | null
  topHolding: ComparedMetric
  topFive: ComparedMetric
}

export type OverviewComparison = {
  windows: OverviewWindows
  value: ComparedMetric
  // Tax data may be missing from the period-end snapshot.
  netValue: number | null
  contributions: ComparedMetric
  marketPerformance: ComparedMetric
  passiveIncome: ComparedMetric
  valueHistory: OverviewValuePoint[]
  heldConcentration: OverviewConcentrationComparison
  lookThroughConcentration: OverviewConcentrationComparison
}

import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend/buildConcentrationTrend.types'

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

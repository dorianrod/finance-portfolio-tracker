import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'

export type HistoricalConcentrationHolding = {
  key: string
  label: string
  name: string
  value: number
  weight: number
}

export type HistoricalConcentrationPoint = {
  date: Date
  positionsTo25Pct: number | null
  positionsTo50Pct: number | null
  positionsTo75Pct: number | null
  positionsTo90Pct: number | null
  effectiveCount: number
  holdingCount: number
  coveragePct: number
  identifiedValue: number
  undisclosedValue: number
  opaqueValue: number
  selectedValue: number
  holdings: HistoricalConcentrationHolding[]
}

export type HistoricalSnapshot = {
  effectiveDate: Date
  capturedAt: Date | null
  holdings: HistoricalFundHolding[]
}

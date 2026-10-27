import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend/buildConcentrationTrend.types'

export function createConcentrationHistoryPoint(
  overrides: Partial<HistoricalConcentrationPoint> = {},
): HistoricalConcentrationPoint {
  return {
    date: new Date('2026-01-31'),
    positionsTo25Pct: 1,
    positionsTo50Pct: 1,
    positionsTo75Pct: 2,
    positionsTo90Pct: 2,
    effectiveCount: 2,
    holdingCount: 2,
    coveragePct: 100,
    identifiedValue: 200,
    undisclosedValue: 0,
    opaqueValue: 0,
    selectedValue: 200,
    holdings: [],
    ...overrides,
  }
}

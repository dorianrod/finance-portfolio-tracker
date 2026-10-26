import type { HistoricalConcentrationPoint } from './buildConcentrationTrend.types'
import { positionsNeededForShare } from './positionsNeededForShare'

export function concentrationPoint(
  date: Date,
  assets: Map<string, { label: string; name: string; value: number }>,
  selectedValue: number,
  identifiedValue: number,
  undisclosedValue: number,
  opaqueValue: number,
): HistoricalConcentrationPoint {
  const ranked = [...assets.entries()]
    .map(([key, asset]) => ({ key, ...asset }))
    .toSorted(
      (left, right) =>
        right.value - left.value || left.key.localeCompare(right.key),
    )
  const holdings = ranked.map((holding) => ({
    ...holding,
    weight: selectedValue > 0 ? (holding.value / selectedValue) * 100 : 0,
  }))
  const squaredWeightSum = holdings.reduce(
    (sum, holding) => sum + Math.pow(holding.weight / 100, 2),
    0,
  )

  return {
    date,
    positionsTo25Pct: positionsNeededForShare(holdings, 25),
    positionsTo50Pct: positionsNeededForShare(holdings, 50),
    positionsTo75Pct: positionsNeededForShare(holdings, 75),
    positionsTo90Pct: positionsNeededForShare(holdings, 90),
    effectiveCount: squaredWeightSum > 0 ? 1 / squaredWeightSum : 0,
    holdingCount: holdings.length,
    coveragePct:
      selectedValue > 0 ? (identifiedValue / selectedValue) * 100 : 0,
    identifiedValue,
    undisclosedValue,
    opaqueValue,
    selectedValue,
    holdings,
  }
}

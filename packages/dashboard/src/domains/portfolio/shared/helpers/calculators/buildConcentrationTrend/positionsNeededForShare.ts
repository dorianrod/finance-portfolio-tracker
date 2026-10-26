import type { HistoricalConcentrationHolding } from './buildConcentrationTrend.types'

export function positionsNeededForShare(
  holdings: HistoricalConcentrationHolding[],
  targetPct: number,
): number | null {
  let cumulativeWeight = 0
  for (let index = 0; index < holdings.length; index += 1) {
    cumulativeWeight += holdings[index].weight
    if (cumulativeWeight + 1e-9 >= targetPct) return index + 1
  }
  return null
}

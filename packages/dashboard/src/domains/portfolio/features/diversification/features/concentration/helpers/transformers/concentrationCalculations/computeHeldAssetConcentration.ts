import { isValuedAnalysisPosition } from '@/domains/portfolio/features/diversification/features/concentration/helpers/transformers/isValuedAnalysisPosition'
import type { ConcentrationSummary } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'
import { resolveAssetName } from '@/domains/portfolio/shared/helpers/transformers/resolveAssetName'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function computeHeldAssetConcentration(
  positions: PositionRow[],
): ConcentrationSummary {
  const byAsset = collectHeldAssets(positions)

  const total = [...byAsset.values()].reduce(
    (sum, holding) => sum + holding.value,
    0,
  )
  const allHoldings = [...byAsset.values()]
    .toSorted((a, b) => b.value - a.value)
    .map((holding) => ({
      ...holding,
      value: Math.round(holding.value),
      weight: total > 0 ? (holding.value / total) * 100 : 0,
    }))
  const holdings = allHoldings.slice(0, 10)

  return {
    topHoldingPct: holdings[0]?.weight ?? 0,
    topFivePct: holdings
      .slice(0, 5)
      .reduce((sum, holding) => sum + holding.weight, 0),
    topTenPct: holdings.reduce((sum, holding) => sum + holding.weight, 0),
    topTenValue: holdings.reduce((sum, holding) => sum + holding.value, 0),
    coveragePct: total > 0 ? 100 : 0,
    identifiedValue: total,
    undisclosedValue: 0,
    opaqueValue: 0,
    selectedValue: total,
    holdingCount: byAsset.size,
    allHoldings,
    holdings,
  }
}

function collectHeldAssets(positions: PositionRow[]) {
  const byAsset = new Map<
    string,
    { label: string; name: string; value: number }
  >()

  for (const position of positions) {
    if (!isValuedAnalysisPosition(position)) continue
    // This is deliberately the allocation-file grain: the instrument or
    // product actually held, aggregated across accounts when its market
    // identifier is shared. Account-valued products fall back to their name.
    const key = position.isin || position.ticker || position.name
    const current = byAsset.get(key) ?? {
      label: resolveAssetName(position, key),
      name: position.name,
      value: 0,
    }
    current.value += position.total_value ?? 0
    byAsset.set(key, current)
  }

  return byAsset
}

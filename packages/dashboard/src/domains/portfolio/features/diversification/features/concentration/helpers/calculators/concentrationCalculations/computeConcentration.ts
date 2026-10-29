import { isValuedAnalysisPosition } from '@/domains/portfolio/features/diversification/features/concentration/helpers/businessRules/isValuedAnalysisPosition'
import type { ConcentrationSummary } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'
import { isFundPosition } from '@/domains/portfolio/shared/helpers/businessRules/isFundPosition'
import { resolveAssetName } from '@/domains/portfolio/shared/helpers/mappers/resolveAssetName'
import { indexFundHoldingsByParent } from '@/domains/portfolio/shared/helpers/selectors/indexFundHoldingsByParent'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Direct, decomposed, undisclosed and opaque positions share one conservation accumulator and ranking.
export function computeConcentration(
  positions: PositionRow[],
  fundHoldings: FundHolding[] = [],
): ConcentrationSummary {
  const byAsset = new Map<
    string,
    { label: string; name: string; value: number }
  >()
  const holdingsByParent = indexFundHoldingsByParent(fundHoldings)

  let selectedValue = 0
  let identifiedValue = 0
  let undisclosedValue = 0
  let opaqueValue = 0

  function addAsset(key: string, label: string, name: string, value: number) {
    const current = byAsset.get(key) ?? { label, name, value: 0 }
    current.value += value
    byAsset.set(key, current)
  }

  for (const position of positions) {
    if (!isValuedAnalysisPosition(position)) continue
    const positionValue = position.total_value ?? 0
    selectedValue += positionValue

    const lookThrough =
      holdingsByParent.get(position.isin) ??
      holdingsByParent.get(position.ticker)
    if (lookThrough != null && lookThrough.length > 0) {
      const exposure = addFundConcentration(
        lookThrough,
        positionValue,
        addAsset,
      )
      identifiedValue += exposure.identified
      undisclosedValue += exposure.undisclosed
      continue
    }

    // Rows without a market identifier are account-level valuations (PEE,
    // PER, bank accounts, private-equity envelopes), not underlying assets.
    // Keep them out of the ranking instead of presenting the account as a
    // holding. Identified non-fund securities remain valid direct exposure.
    const key = position.isin || position.ticker
    if (!key) {
      opaqueValue += positionValue
      continue
    }
    if (isFundPosition(position)) {
      undisclosedValue += positionValue
      continue
    }
    addAsset(key, resolveAssetName(position, key), position.name, positionValue)
    identifiedValue += positionValue
  }

  const allHoldings = [...byAsset.values()]
    .toSorted((a, b) => b.value - a.value)
    .map((holding) => ({
      ...holding,
      value: Math.round(holding.value),
      weight: selectedValue > 0 ? (holding.value / selectedValue) * 100 : 0,
    }))
  const holdings = allHoldings.slice(0, 10)

  return {
    topHoldingPct: holdings[0]?.weight ?? 0,
    topFivePct: holdings
      .slice(0, 5)
      .reduce((sum, holding) => sum + holding.weight, 0),
    topTenPct: holdings.reduce((sum, holding) => sum + holding.weight, 0),
    topTenValue: holdings.reduce((sum, holding) => sum + holding.value, 0),
    coveragePct:
      selectedValue > 0 ? (identifiedValue / selectedValue) * 100 : 0,
    identifiedValue,
    undisclosedValue,
    opaqueValue,
    selectedValue,
    holdingCount: allHoldings.length,
    allHoldings,
    holdings,
  }
}

function addFundConcentration(
  lookThrough: FundHolding[],
  positionValue: number,
  addAsset: (key: string, label: string, name: string, value: number) => void,
) {
  const disclosedWeight = lookThrough.reduce(
    (sum, holding) => sum + holding.weight,
    0,
  )
  const scale = disclosedWeight > 1 ? 1 / disclosedWeight : 1
  for (const holding of lookThrough) {
    addAsset(
      holding.issuerId || holding.holdingId,
      holding.issuerName || holding.holdingName,
      holding.issuerName || holding.holdingName,
      positionValue * holding.weight * scale,
    )
  }
  const explainedWeight = Math.min(1, disclosedWeight)
  return {
    identified: positionValue * explainedWeight,
    undisclosed: positionValue * (1 - explainedWeight),
  }
}

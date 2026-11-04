import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { buildIssuerExposures } from './buildIssuerExposures'

export function buildFundIssuerExposures(
  positions: PositionRow[],
  holdings: FundHolding[],
  statuses: FundHoldingStatus[],
  selectedFundName: string,
) {
  const scopedPositions = selectedFundName
    ? positions.filter((position) => position.name === selectedFundName)
    : positions
  const parentIds = new Set(
    scopedPositions
      .flatMap((position) => [position.isin, position.ticker])
      .filter(Boolean),
  )
  const scopedHoldings = selectedFundName
    ? holdings.filter(
        (holding) =>
          holding.parentName === selectedFundName ||
          parentIds.has(holding.parentIsin) ||
          parentIds.has(holding.parentTicker),
      )
    : holdings
  return buildIssuerExposures(scopedPositions, scopedHoldings, statuses)
}

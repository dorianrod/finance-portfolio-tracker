import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function holdingsForPosition(
  position: PositionRow,
  holdings: FundHolding[],
): FundHolding[] {
  return holdings.filter(
    (holding) =>
      (!!position.isin && holding.parentIsin === position.isin) ||
      (!!position.ticker && holding.parentTicker === position.ticker),
  )
}

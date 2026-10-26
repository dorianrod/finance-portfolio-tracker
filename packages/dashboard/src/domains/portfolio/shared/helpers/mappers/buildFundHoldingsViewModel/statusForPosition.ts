import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function statusForPosition(
  position: PositionRow,
  statuses: FundHoldingStatus[],
): FundHoldingStatus | undefined {
  return statuses.find(
    (status) =>
      (!!position.isin && status.parentIsin === position.isin) ||
      (!!position.ticker && status.parentTicker === position.ticker) ||
      status.parentId === (position.isin || position.ticker),
  )
}

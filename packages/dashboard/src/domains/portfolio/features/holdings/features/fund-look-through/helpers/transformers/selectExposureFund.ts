import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function selectExposureFund(
  positions: PositionRow[],
  statuses: FundHoldingStatus[],
  needle: string,
) {
  const selectedFundName = needle
    ? (positions.find(
        (position) =>
          position.name.toLocaleLowerCase() === needle &&
          matchesFundStatus(position, statuses),
      )?.name ?? '')
    : ''
  return selectedFundName
}

function matchesFundStatus(
  position: PositionRow,
  statuses: FundHoldingStatus[],
): boolean {
  return statuses.some(
    (status) =>
      status.parentId === (position.isin || position.ticker) ||
      (!!position.isin && status.parentIsin === position.isin) ||
      (!!position.ticker && status.parentTicker === position.ticker),
  )
}

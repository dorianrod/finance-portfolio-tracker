import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export type FundPositionPopoverTarget = {
  position: PositionRow
  status: FundHoldingStatus
  buttonRect: DOMRect
}

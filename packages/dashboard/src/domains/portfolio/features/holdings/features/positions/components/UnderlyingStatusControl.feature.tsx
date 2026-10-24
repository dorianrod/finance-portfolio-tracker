import { useAtomValue } from 'jotai'

import { positionUnderlyingPopoverAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionUnderlyingPopover.atoms'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'

import { UnderlyingStatusButton } from './PositionTableCells.view'

export function UnderlyingStatusControl({
  positionId,
  ...props
}: {
  positionId: string
  status: FundHoldingStatus
  assetName: string
  onShow: (button: HTMLButtonElement) => void
  onHide: () => void
}) {
  const popover = useAtomValue(positionUnderlyingPopoverAtom)
  return (
    <UnderlyingStatusButton
      {...props}
      isOpen={popover?.position.id === positionId}
    />
  )
}

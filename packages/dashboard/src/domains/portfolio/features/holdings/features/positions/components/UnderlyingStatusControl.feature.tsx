import { useAtomValue } from 'jotai'

import { UnderlyingStatusButton } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableCells/UnderlyingStatusButton.view'
import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreview.atoms'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'

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
  const selection = useAtomValue(positionPreviewAtom)
  return (
    <UnderlyingStatusButton
      {...props}
      isOpen={
        selection?.kind === 'underlying' && selection.positionId === positionId
      }
    />
  )
}

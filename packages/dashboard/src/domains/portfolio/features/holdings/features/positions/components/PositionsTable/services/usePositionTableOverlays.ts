import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { resolvePositionPreview } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/presenters/resolvePositionPreview'
import { usePositionPreviewActions } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/actions/usePositionPreviewActions'
import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreviewAtom'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { useDelayedDismiss } from '@/shared/ui/services/useDelayedDismiss'

export function usePositionTableOverlays(
  positions: PositionRow[],
  statuses: FundHoldingStatus[],
  allocations: Map<string, IsinAllocation>,
) {
  const selection = useAtomValue(positionPreviewAtom)
  const { dismiss } = usePositionPreviewActions()
  const preview = useMemo(
    () => resolvePositionPreview(selection, positions, statuses, allocations),
    [selection, positions, statuses, allocations],
  )
  const { cancel: cancelHide, schedule: scheduleHide } =
    useDelayedDismiss(dismiss)

  useEffect(() => {
    if (selection && preview === null) dismiss()
  }, [dismiss, selection, preview])
  useEffect(() => dismiss, [dismiss])

  return useMemo(
    () => ({ preview, dismiss, cancelHide, scheduleHide }),
    [preview, dismiss, cancelHide, scheduleHide],
  )
}

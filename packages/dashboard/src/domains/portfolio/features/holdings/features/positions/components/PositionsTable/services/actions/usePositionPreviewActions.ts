import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreviewAtom'
import type { PositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/types/positionPreviewSelection.type'

export function usePositionPreviewActions() {
  const setPreview = useSetAtom(positionPreviewAtom)
  const showPreview = useCallback(
    (selection: PositionPreviewSelection) => setPreview(selection),
    [setPreview],
  )
  const dismiss = useCallback(() => setPreview(null), [setPreview])
  return useMemo(() => ({ showPreview, dismiss }), [showPreview, dismiss])
}

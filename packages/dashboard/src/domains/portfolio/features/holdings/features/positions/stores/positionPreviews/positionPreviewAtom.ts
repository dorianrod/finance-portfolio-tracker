import { atom } from 'jotai'

import type { PositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/types/positionPreviewSelection.type'

const DEFAULT_POSITION_PREVIEW = null

export const positionPreviewAtom = atom<PositionPreviewSelection | null>(
  DEFAULT_POSITION_PREVIEW,
)

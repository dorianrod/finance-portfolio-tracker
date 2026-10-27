import { atom } from 'jotai'

import type { AllocationHoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/allocationHoverTarget.type'

const DEFAULT_POSITION_ALLOCATION_PREVIEW = null

export const positionAllocationPreviewAtom = atom<AllocationHoverTarget | null>(
  DEFAULT_POSITION_ALLOCATION_PREVIEW,
)

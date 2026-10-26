import { atom } from 'jotai'

import type { AllocationFilter } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

export const dashboardDiversificationFilterAtom = atom<AllocationFilter | null>(
  null,
)
export const dashboardDiversificationPositionsOpenAtom = atom<boolean>(false)

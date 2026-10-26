import { atom } from 'jotai'

import type { AllocationFilter } from '@/domains/portfolio/shared/types/allocationChart.type'
import type { DiversificationView } from '@/domains/portfolio/shared/types/dashboardView.type'

export const dashboardDiversificationFilterAtom = atom<AllocationFilter | null>(
  null,
)
export const dashboardDiversificationViewAtom =
  atom<DiversificationView>('current')
export const dashboardDiversificationPositionsOpenAtom = atom<boolean>(false)

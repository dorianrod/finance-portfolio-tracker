import { atom } from 'jotai'
import type { AllocationFilter } from '@/domains/portfolio/shared/types/allocationChart.type'
import type { AllocationView } from '@/domains/portfolio/shared/types/dashboardView.type'

export const dashboardAllocationFilterAtom = atom<AllocationFilter | null>(null)
export const dashboardAllocationViewAtom = atom<AllocationView>('current')
export const dashboardAllocationPositionsOpenAtom = atom<boolean>(false)

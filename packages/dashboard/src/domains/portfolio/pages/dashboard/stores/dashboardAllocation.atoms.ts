import { atom } from 'jotai'
import type { AllocationFilter } from '@/domains/portfolio/components/allocation-charts/allocationCharts.types'
import type { AllocationView } from '@/domains/portfolio/components/allocation-charts/AllocationViewToggle'

export const dashboardAllocationFilterAtom = atom<AllocationFilter | null>(null)
export const dashboardAllocationViewAtom = atom<AllocationView>('current')
export const dashboardAllocationPositionsOpenAtom = atom<boolean>(false)

import { useCallback, useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
  dashboardAllocationViewAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'
import type { AllocationFilter } from '@/domains/portfolio/components/allocation-charts/allocationCharts.types'

export function useDashboardAllocation() {
  const [allocationFilter, setAllocationFilter] = useAtom(dashboardAllocationFilterAtom)
  const [positionsOpen, setPositionsOpen] = useAtom(dashboardAllocationPositionsOpenAtom)
  const [allocationView, setAllocationView] = useAtom(dashboardAllocationViewAtom)
  const toggleFilter = useCallback((filter: AllocationFilter) => {
    const isSameFilter = allocationFilter?.type === filter.type
      && allocationFilter.value === filter.value
    setPositionsOpen(false)
    setAllocationFilter(isSameFilter ? null : filter)
  }, [allocationFilter, setAllocationFilter, setPositionsOpen])
  const togglePositions = useCallback(
    () => setPositionsOpen((open) => !open),
    [setPositionsOpen],
  )
  const closePositions = useCallback(() => setPositionsOpen(false), [setPositionsOpen])
  const clearFilter = useCallback(() => {
    setPositionsOpen(false)
    setAllocationFilter(null)
  }, [setAllocationFilter, setPositionsOpen])

  return useMemo(
    () => ({
      allocationFilter,
      allocationView,
      clearFilter,
      closePositions,
      positionsOpen,
      setAllocationView,
      toggleFilter,
      togglePositions,
    }),
    [
      allocationFilter,
      allocationView,
      clearFilter,
      closePositions,
      positionsOpen,
      setAllocationView,
      toggleFilter,
      togglePositions,
    ],
  )
}

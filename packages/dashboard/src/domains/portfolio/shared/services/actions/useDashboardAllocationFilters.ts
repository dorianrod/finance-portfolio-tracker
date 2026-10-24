import { useCallback, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import type { AllocationFilter } from '@/domains/portfolio/shared/types/allocationChart.type'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'

export function useDashboardAllocationFilters() {
  const setAllocationFilter = useSetAtom(dashboardAllocationFilterAtom)
  const setPositionsOpen = useSetAtom(dashboardAllocationPositionsOpenAtom)

  const toggleFilter = useCallback((filter: AllocationFilter) => {
    setPositionsOpen(false)
    setAllocationFilter((current) => {
      const isSameFilter = current?.type === filter.type
        && current.value === filter.value
      return isSameFilter ? null : filter
    })
  }, [setAllocationFilter, setPositionsOpen])

  const clearFilter = useCallback(() => {
    setPositionsOpen(false)
    setAllocationFilter(null)
  }, [setAllocationFilter, setPositionsOpen])

  return useMemo(
    () => ({ clearFilter, toggleFilter }),
    [clearFilter, toggleFilter],
  )
}

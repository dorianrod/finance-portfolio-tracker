import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  dashboardDiversificationFilterAtom,
  dashboardDiversificationPositionsOpenAtom,
} from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation.atoms'
import type { AllocationFilter } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

export function useDashboardDiversificationFilters() {
  const setAllocationFilter = useSetAtom(dashboardDiversificationFilterAtom)
  const setPositionsOpen = useSetAtom(dashboardDiversificationPositionsOpenAtom)

  const toggleFilter = useCallback(
    (filter: AllocationFilter) => {
      setPositionsOpen(false)
      setAllocationFilter((current) => {
        const isSameFilter =
          current?.type === filter.type && current.value === filter.value
        return isSameFilter ? null : filter
      })
    },
    [setAllocationFilter, setPositionsOpen],
  )

  const clearFilter = useCallback(() => {
    setPositionsOpen(false)
    setAllocationFilter(null)
  }, [setAllocationFilter, setPositionsOpen])

  return useMemo(
    () => ({ clearFilter, toggleFilter }),
    [clearFilter, toggleFilter],
  )
}

import { useCallback, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { resetFilters } from '@/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters'
import {
  dashboardFiltersAtom,
  dashboardFiltersOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'

export function useDashboardFilters() {
  const setFilters = useSetAtom(dashboardFiltersAtom)
  const setFiltersOpen = useSetAtom(dashboardFiltersOpenAtom)
  const setAllocationFilter = useSetAtom(dashboardAllocationFilterAtom)
  const setAllocationPositionsOpen = useSetAtom(dashboardAllocationPositionsOpenAtom)

  const openFilters = useCallback(() => setFiltersOpen(true), [setFiltersOpen])
  const closeFilters = useCallback(() => setFiltersOpen(false), [setFiltersOpen])
  const resetDashboardFilters = useCallback(() => {
    setFilters(resetFilters())
    setAllocationFilter(null)
    setAllocationPositionsOpen(false)
  }, [setAllocationFilter, setAllocationPositionsOpen, setFilters])

  return useMemo(
    () => ({ closeFilters, openFilters, resetDashboardFilters, setFilters }),
    [closeFilters, openFilters, resetDashboardFilters, setFilters],
  )
}

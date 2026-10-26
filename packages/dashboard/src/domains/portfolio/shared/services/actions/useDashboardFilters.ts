import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { resetFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import {
  dashboardDiversificationFilterAtom,
  dashboardDiversificationPositionsOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardDiversification.atoms'
import {
  dashboardFiltersAtom,
  dashboardFiltersOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'

export function useDashboardFilters() {
  const setFilters = useSetAtom(dashboardFiltersAtom)
  const setFiltersOpen = useSetAtom(dashboardFiltersOpenAtom)
  const setAllocationFilter = useSetAtom(dashboardDiversificationFilterAtom)
  const setAllocationPositionsOpen = useSetAtom(
    dashboardDiversificationPositionsOpenAtom,
  )

  const openFilters = useCallback(() => setFiltersOpen(true), [setFiltersOpen])
  const closeFilters = useCallback(
    () => setFiltersOpen(false),
    [setFiltersOpen],
  )
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

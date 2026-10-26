import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { resetFilters } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import {
  dashboardFiltersAtom,
  dashboardFiltersOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'

export function useDashboardFilters() {
  const setFilters = useSetAtom(dashboardFiltersAtom)
  const setFiltersOpen = useSetAtom(dashboardFiltersOpenAtom)

  const openFilters = useCallback(() => setFiltersOpen(true), [setFiltersOpen])
  const closeFilters = useCallback(
    () => setFiltersOpen(false),
    [setFiltersOpen],
  )
  const resetDashboardFilters = useCallback(() => {
    setFilters(resetFilters())
  }, [setFilters])

  return useMemo(
    () => ({ closeFilters, openFilters, resetDashboardFilters, setFilters }),
    [closeFilters, openFilters, resetDashboardFilters, setFilters],
  )
}

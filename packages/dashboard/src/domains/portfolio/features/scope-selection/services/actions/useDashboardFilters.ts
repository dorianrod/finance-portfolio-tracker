import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { resetFilters } from '@/domains/portfolio/features/scope-selection/helpers/filters/resetFilters'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

export function useDashboardFilters() {
  const setFilters = useSetAtom(dashboardFiltersAtom)
  const resetDashboardFilters = useCallback(() => {
    setFilters(resetFilters())
  }, [setFilters])

  return useMemo(
    () => ({ resetDashboardFilters, setFilters }),
    [resetDashboardFilters, setFilters],
  )
}

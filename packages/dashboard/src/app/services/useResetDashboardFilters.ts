import { useCallback } from 'react'

import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { useDashboardFilters } from '@/domains/portfolio/features/scope-selection/services/actions/useDashboardFilters'

export function useResetDashboardFilters() {
  const { resetDashboardFilters } = useDashboardFilters()
  const { clearFilter } = useDashboardDiversificationFilters()
  return useCallback(() => {
    resetDashboardFilters()
    clearFilter()
  }, [resetDashboardFilters, clearFilter])
}

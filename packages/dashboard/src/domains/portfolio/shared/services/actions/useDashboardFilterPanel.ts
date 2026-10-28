import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardFiltersOpenAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpenAtom'

export function useDashboardFilterPanel() {
  const setOpen = useSetAtom(dashboardFiltersOpenAtom)
  const openFilters = useCallback(() => setOpen(true), [setOpen])
  const closeFilters = useCallback(() => setOpen(false), [setOpen])
  return useMemo(
    () => ({ openFilters, closeFilters }),
    [openFilters, closeFilters],
  )
}

import { useCallback, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  dashboardExpandedPositionRowsAtom,
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardPositionsTable.atoms'
import type { SortKey } from '@/domains/portfolio/types/filters'

export function useDashboardPositionsTable() {
  const setExpanded = useSetAtom(dashboardExpandedPositionRowsAtom)
  const setSortDir = useSetAtom(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const setSortKey = useSetAtom(dashboardPositionSortKeyAtom)

  const sort = useCallback((key: SortKey) => {
    if (key === sortKey) {
      setSortDir((direction) => direction === 'desc' ? 'asc' : 'desc')
      return
    }
    setSortKey(key)
    setSortDir('desc')
  }, [setSortDir, setSortKey, sortKey])

  return useMemo(
    () => ({ setExpanded, sort }),
    [setExpanded, sort],
  )
}

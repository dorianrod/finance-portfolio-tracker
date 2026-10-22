import { useCallback, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  dashboardExpandedPositionRowsAtom,
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardPositionsTable.atoms'
import type { SortKey } from '@/domains/portfolio/types/filters'

export function useDashboardPositionsTable() {
  const [expanded, setExpanded] = useAtom(dashboardExpandedPositionRowsAtom)
  const setSortDir = useSetAtom(dashboardPositionSortDirectionAtom)
  const [sortKey, setSortKey] = useAtom(dashboardPositionSortKeyAtom)

  const sort = useCallback((key: SortKey) => {
    if (key === sortKey) {
      setSortDir((direction) => direction === 'desc' ? 'asc' : 'desc')
      return
    }
    setSortKey(key)
    setSortDir('desc')
  }, [setSortDir, setSortKey, sortKey])

  return useMemo(
    () => ({ expanded, setExpanded, sort }),
    [expanded, setExpanded, sort],
  )
}

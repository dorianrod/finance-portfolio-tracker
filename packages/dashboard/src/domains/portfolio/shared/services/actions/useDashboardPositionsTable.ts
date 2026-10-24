import { useCallback, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  dashboardExpandedPositionRowsAtom,
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/shared/stores/dashboardPositionsTable.atoms'
import type { PositionSortKey } from '@/domains/portfolio/shared/types/positionSort.type'

export function useDashboardPositionsTable() {
  const setExpanded = useSetAtom(dashboardExpandedPositionRowsAtom)
  const setSortDir = useSetAtom(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const setSortKey = useSetAtom(dashboardPositionSortKeyAtom)

  const sort = useCallback((key: PositionSortKey) => {
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

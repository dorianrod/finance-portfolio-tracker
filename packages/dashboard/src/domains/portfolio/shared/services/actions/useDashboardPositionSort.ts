import {
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/shared/stores/dashboardPositionsTable.atoms'
import type { PositionSortKey } from '@/domains/portfolio/shared/types/positionSort.type'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

export function useDashboardPositionSort() {
  const setSortDir = useSetAtom(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const setSortKey = useSetAtom(dashboardPositionSortKeyAtom)

  const sort = useCallback(
    (key: PositionSortKey) => {
      if (key === sortKey) {
        setSortDir((direction) => (direction === 'desc' ? 'asc' : 'desc'))
        return
      }
      setSortKey(key)
      setSortDir('desc')
    },
    [setSortDir, setSortKey, sortKey],
  )

  return useMemo(() => ({ sort }), [sort])
}

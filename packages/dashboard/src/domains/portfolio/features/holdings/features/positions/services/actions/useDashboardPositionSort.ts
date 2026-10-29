import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardPositionSortDirectionAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortDirection.atoms'
import { dashboardPositionSortKeyAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortKey.atoms'
import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'

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

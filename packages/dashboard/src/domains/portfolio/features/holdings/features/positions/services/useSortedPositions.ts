import { useMemo } from 'react'

import { sortPositionsForTable } from '@/domains/portfolio/features/holdings/features/positions/helpers/selectors/sortPositionsForTable'
import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function useSortedPositions(
  positions: PositionRow[],
  hideClosed: boolean,
  accountTypes: string[],
  sortKey: PositionSortKey,
  direction: 'asc' | 'desc',
) {
  return useMemo(
    () =>
      sortPositionsForTable(
        positions,
        hideClosed,
        accountTypes,
        sortKey,
        direction,
      ),
    [positions, hideClosed, accountTypes, sortKey, direction],
  )
}

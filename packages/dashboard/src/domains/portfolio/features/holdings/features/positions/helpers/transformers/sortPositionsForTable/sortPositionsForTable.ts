import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { getSortValue } from './getSortValue'

export function sortPositionsForTable(
  filtered: readonly PositionRow[],
  hideClosedPositions: boolean,
  allAccountTypes: readonly string[],
  sortKey: PositionSortKey,
  sortDir: 'asc' | 'desc',
): PositionRow[] {
  const rows = filtered.filter(
    (p) => !hideClosedPositions || p.status !== 'closed',
  )
  const groupByAccountType = allAccountTypes.length > 0
  return rows.toSorted((a, b) => {
    const ta = a.account_type ?? ''
    const tb = b.account_type ?? ''
    if (groupByAccountType && ta !== tb) return ta.localeCompare(tb, 'en')
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    const av = getSortValue(a, sortKey)
    const bv = getSortValue(b, sortKey)
    return sortDir === 'desc' ? bv - av : av - bv
  })
}

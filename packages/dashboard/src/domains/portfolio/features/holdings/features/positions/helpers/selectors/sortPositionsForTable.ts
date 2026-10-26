import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function getSortValue(row: PositionRow, key: PositionSortKey): number {
  switch (key) {
    case 'total_value':
      return row.total_value ?? 0
    case 'unrealized_gain':
      return row.unrealized_gain ?? 0
    case 'realized_gain':
      return row.realized_gain
    case 'total_realized_return':
      return row.total_realized_return
    case 'total_dividends':
      return row.total_dividends + row.total_interest
    case 'total_return_pct':
      return row.total_return_pct ?? 0
    case 'xirr':
      return row.xirr ?? 0
  }
}

export function sortPositionsForTable(
  filtered: PositionRow[],
  hideClosedPositions: boolean,
  allAccountTypes: string[],
  sortKey: PositionSortKey,
  sortDir: 'asc' | 'desc',
): PositionRow[] {
  const rows = filtered.filter(
    (p) => !hideClosedPositions || p.status !== 'closed',
  )
  if (allAccountTypes.length === 0) return rows
  return [...rows].toSorted((a, b) => {
    const ta = a.account_type ?? ''
    const tb = b.account_type ?? ''
    if (ta !== tb) return ta.localeCompare(tb, 'en')
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    const av = getSortValue(a, sortKey)
    const bv = getSortValue(b, sortKey)
    return sortDir === 'desc' ? bv - av : av - bv
  })
}

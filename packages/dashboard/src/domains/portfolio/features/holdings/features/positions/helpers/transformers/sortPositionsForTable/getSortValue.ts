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

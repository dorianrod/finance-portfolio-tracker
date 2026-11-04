import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import type { PositionGroupTotal } from './calculatePositionTableValues.types'

export function calculatePositionGroupTotals(
  positions: PositionRow[],
): Map<string, PositionGroupTotal> {
  const totals = new Map<string, PositionGroupTotal>()
  for (const position of positions) {
    const type = position.account_type ?? ''
    const current = totals.get(type) ?? {
      dividends: 0,
      realized: 0,
      totalRealized: 0,
      unrealized: 0,
      value: 0,
    }
    totals.set(type, {
      dividends:
        current.dividends + position.total_dividends + position.total_interest,
      realized: current.realized + position.realized_gain,
      totalRealized: current.totalRealized + position.total_realized_return,
      unrealized: current.unrealized + (position.unrealized_gain ?? 0),
      value: current.value + (position.total_value ?? 0),
    })
  }
  return totals
}

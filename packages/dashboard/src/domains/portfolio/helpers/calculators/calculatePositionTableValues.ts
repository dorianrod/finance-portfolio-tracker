import { CASH_SUFFIX } from '@/domains/portfolio/constants/accountCategories'
import type { PositionRow } from '@/domains/portfolio/types/domain'

export interface PositionGroupTotal {
  dividends: number
  realized: number
  totalRealized: number
  unrealized: number
  value: number
}

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
      dividends: current.dividends + position.total_dividends + position.total_interest,
      realized: current.realized + position.realized_gain,
      totalRealized: current.totalRealized + position.total_realized_return,
      unrealized: current.unrealized + (position.unrealized_gain ?? 0),
      value: current.value + (position.total_value ?? 0),
    })
  }
  return totals
}

export function shouldShowPositionQuantity(position: PositionRow): boolean {
  return position.account_category === 'brokerage'
    && !position.account_type?.endsWith(CASH_SUFFIX)
    && position.quantity != null
}

export function calculatePassiveIncomeTax(
  gross: number,
  net: number | null,
  taxRate: number | null,
): number | null {
  return gross > 0 && net != null && taxRate != null && taxRate > 0
    ? gross - net
    : null
}

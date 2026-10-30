import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function isTaxFreePassiveIncome(position: PositionRow): boolean {
  return (
    position.tax_rate === 0 &&
    (position.total_dividends > 0 || position.total_interest > 0)
  )
}

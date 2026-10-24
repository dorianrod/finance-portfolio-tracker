import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'

export function isClosedPosition(row: TableRow): boolean {
  return row.kind === 'position' && row.status === 'closed'
}

export function isTaxFreePassiveIncome(position: PositionRow): boolean {
  return (
    position.tax_rate === 0 &&
    (position.total_dividends > 0 || position.total_interest > 0)
  )
}

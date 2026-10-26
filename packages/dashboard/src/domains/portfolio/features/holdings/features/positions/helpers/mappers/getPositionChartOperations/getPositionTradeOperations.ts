import type { Operation } from '@/domains/portfolio/features/holdings/features/positions/types/positionChartOperation.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function getPositionTradeOperations(position: PositionRow): Operation[] {
  return position.subRows
    .flatMap((group) => group.subRows)
    .filter(
      (operation) =>
        operation.operation_type === 'BUY' ||
        operation.operation_type === 'SELL',
    )
    .map((operation) => ({
      date: operation.date,
      operation_type: operation.operation_type,
      realized_gain: operation.realized_gain,
      total_amount: operation.total_amount,
    }))
}

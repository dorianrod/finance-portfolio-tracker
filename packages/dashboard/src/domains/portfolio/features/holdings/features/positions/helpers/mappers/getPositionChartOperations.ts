import type { Operation } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
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

export function getPositionSavingsOperations(position: PositionRow) {
  return position.subRows
    .flatMap((group) => group.subRows)
    .filter(
      (operation) =>
        operation.operation_type === 'DEPOSIT' ||
        operation.operation_type === 'WITHDRAWAL' ||
        operation.operation_type === 'INTEREST',
    )
    .map((operation) => ({
      date: operation.date,
      operation_type: operation.operation_type,
      total_amount: operation.total_amount,
    }))
}

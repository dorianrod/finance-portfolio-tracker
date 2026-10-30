import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

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

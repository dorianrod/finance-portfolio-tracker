import type { OperationRow } from '@/domains/portfolio/shared/types/positionRow.type'

export type SavingsChartTarget = {
  name: string
  operations: Array<
    Pick<OperationRow, 'date' | 'total_amount' | 'operation_type'>
  >
  buttonRect: DOMRect
}

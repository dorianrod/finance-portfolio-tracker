import type { OperationRow } from '@/domains/portfolio/shared/types/positionRow.type'

export type PositionChartOperation = Pick<
  OperationRow,
  'date' | 'operation_type' | 'total_amount' | 'realized_gain'
>

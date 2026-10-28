import type { RowData } from '@tanstack/react-table'

import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
export type PositionColumnContext = {
  allocationData: Map<string, IsinAllocation>
  fundStatuses: FundHoldingStatus[]
  cancelHide: () => void
  scheduleHide: () => void
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    positionColumns?: TData extends TableRow ? PositionColumnContext : never
  }
}

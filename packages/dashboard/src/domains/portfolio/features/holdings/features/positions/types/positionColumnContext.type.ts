import type { RowData } from '@tanstack/react-table'

import type { FundStatusIndex } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/indexFundStatuses'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
export type PositionColumnContext = {
  allocationData: Map<string, IsinAllocation>
  fundStatusIndex: FundStatusIndex
  cancelHide: () => void
  scheduleHide: () => void
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    positionColumns?: TData extends TableRow ? PositionColumnContext : never
  }
}

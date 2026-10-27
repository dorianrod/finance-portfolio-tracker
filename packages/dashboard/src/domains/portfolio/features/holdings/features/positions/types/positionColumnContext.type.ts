import type { RowData } from '@tanstack/react-table'

import type { usePositionTableData } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableData'
import type { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
export type PositionColumnContext = {
  allocationData: ReturnType<typeof usePositionTableData>['allocationData']
  fundStatuses: FundHoldingStatus[]
  cancelHide: ReturnType<typeof usePositionTableOverlays>['cancelHide']
  scheduleHide: ReturnType<typeof usePositionTableOverlays>['scheduleHide']
  setAllocationHover: ReturnType<
    typeof usePositionTableOverlays
  >['setAllocationHover']
  setChart: ReturnType<typeof usePositionTableOverlays>['setChart']
  setSavingsChart: ReturnType<
    typeof usePositionTableOverlays
  >['setSavingsChart']
  setUnderlyingPopover: ReturnType<
    typeof usePositionTableOverlays
  >['setUnderlyingPopover']
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    positionColumns?: TData extends TableRow ? PositionColumnContext : never
  }
}

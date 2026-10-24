import { calculatePositionGroupTotals } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues'
import { useAllocationsByIsinQuery } from '@/domains/portfolio/shared/apis/queries/useAllocationsByIsinQuery'
import type { IsinAllocation } from '@/domains/portfolio/shared/types/isinAllocation.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { useMemo } from 'react'

const EMPTY_ALLOCATION_DATA = new Map<string, IsinAllocation>()

export function usePositionTableData(data: PositionRow[]) {
  const { data: allocationData = EMPTY_ALLOCATION_DATA } = useAllocationsByIsinQuery()
  const groupTotals = useMemo(() => calculatePositionGroupTotals(data), [data])
  return useMemo(() => ({ allocationData, groupTotals }), [allocationData, groupTotals])
}

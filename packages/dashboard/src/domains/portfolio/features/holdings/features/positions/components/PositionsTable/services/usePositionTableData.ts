import { useMemo } from 'react'

import { useGetAllocationsByIsinQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/useGetAllocationsByIsinQuery'
import { calculatePositionGroupTotals } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues/calculatePositionGroupTotals'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function usePositionTableData(data: PositionRow[]) {
  const { data: allocationData = EMPTY_ALLOCATION_DATA } =
    useGetAllocationsByIsinQuery()
  const groupTotals = useMemo(() => calculatePositionGroupTotals(data), [data])
  return useMemo(
    () => ({ allocationData, groupTotals }),
    [allocationData, groupTotals],
  )
}

const EMPTY_ALLOCATION_DATA = new Map<string, IsinAllocation>()

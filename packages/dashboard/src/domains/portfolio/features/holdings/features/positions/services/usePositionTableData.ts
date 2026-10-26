import { useMemo } from 'react'

import { useAllocationsByIsinQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/useAllocationsByIsinQuery'
import { calculatePositionGroupTotals } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function usePositionTableData(data: PositionRow[]) {
  const { data: allocationData = EMPTY_ALLOCATION_DATA } =
    useAllocationsByIsinQuery()
  const groupTotals = useMemo(() => calculatePositionGroupTotals(data), [data])
  return useMemo(
    () => ({ allocationData, groupTotals }),
    [allocationData, groupTotals],
  )
}

const EMPTY_ALLOCATION_DATA = new Map<string, IsinAllocation>()

import { useMemo } from 'react'

import { useGetAllocationsByIsinQuery } from '@/domains/portfolio/features/holdings/features/positions/apis/queries/useGetAllocationsByIsinQuery'
import { calculatePositionGroupTotals } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/calculatePositionTableValues/calculatePositionGroupTotals'
import { indexFundStatuses } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/indexFundStatuses'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function usePositionTableData(
  data: PositionRow[],
  fundStatuses: FundHoldingStatus[],
) {
  const { data: allocationData = EMPTY_ALLOCATION_DATA } =
    useGetAllocationsByIsinQuery()
  const groupTotals = useMemo(() => calculatePositionGroupTotals(data), [data])
  const fundStatusIndex = useMemo(
    () => indexFundStatuses(fundStatuses),
    [fundStatuses],
  )
  return useMemo(
    () => ({ allocationData, groupTotals, fundStatusIndex }),
    [allocationData, groupTotals, fundStatusIndex],
  )
}

const EMPTY_ALLOCATION_DATA = new Map<string, IsinAllocation>()

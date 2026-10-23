import { useMemo } from 'react'
import type { PositionRow } from '@/domains/portfolio/shared/types/domain'
import { useAllocationByIsin } from '@/domains/portfolio/shared/apis/queries/useAllocationByIsin'
import { calculatePositionGroupTotals } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculatePositionTableValues'

export function usePositionTableData(data: PositionRow[]) {
  const { data: allocationData } = useAllocationByIsin()
  const groupTotals = useMemo(() => calculatePositionGroupTotals(data), [data])
  return { allocationData, groupTotals }
}

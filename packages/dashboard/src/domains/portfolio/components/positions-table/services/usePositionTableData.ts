import { useMemo } from 'react'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { useAllocationByIsin } from '@/domains/portfolio/apis/queries/useAllocationByIsin'
import { calculatePositionGroupTotals } from '@/domains/portfolio/helpers/calculators/calculatePositionTableValues'

export function usePositionTableData(data: PositionRow[]) {
  const { data: allocationData } = useAllocationByIsin()
  const groupTotals = useMemo(() => calculatePositionGroupTotals(data), [data])
  return { allocationData, groupTotals }
}

import { useAtomValue } from 'jotai'

import { useDashboardPositionSort } from '@/domains/portfolio/shared/services/actions/useDashboardPositionSort'
import {
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/shared/stores/dashboardPositionsTable.atoms'
import type { PositionSortKey } from '@/domains/portfolio/shared/types/positionSort.type'

import { SortHeader } from './SortHeader.view'

export function PositionSortHeader({
  label,
  tooltip,
  col,
}: {
  label: string
  tooltip: string
  col: PositionSortKey
}) {
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const { sort } = useDashboardPositionSort()
  return (
    <SortHeader
      label={label}
      tooltip={tooltip}
      col={col}
      activeKey={sortKey}
      dir={sortDir}
      onSort={sort}
    />
  )
}

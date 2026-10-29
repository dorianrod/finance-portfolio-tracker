import { useAtomValue } from 'jotai'

import { useDashboardPositionSort } from '@/domains/portfolio/features/holdings/features/positions/services/actions/useDashboardPositionSort'
import { dashboardPositionSortDirectionAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortDirection.atoms'
import { dashboardPositionSortKeyAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortKey.atoms'
import type { PositionSortKey } from '@/domains/portfolio/features/holdings/features/positions/types/positionSort.type'

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

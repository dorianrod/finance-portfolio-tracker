import { useAtomValue } from 'jotai'
import { useDashboardPositionsTable } from '@/domains/portfolio/shared/services/actions/useDashboardPositionsTable'
import {
  dashboardPositionSortDirectionAtom,
  dashboardExpandedPositionRowsAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/shared/stores/dashboardPositionsTable.atoms'

export function usePositionTableState() {
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const expanded = useAtomValue(dashboardExpandedPositionRowsAtom)
  const { setExpanded, sort: onSort } = useDashboardPositionsTable()
  return { expanded, onSort, setExpanded, sortDir, sortKey }
}

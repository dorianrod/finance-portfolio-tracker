import { useAtomValue } from 'jotai'
import { useDashboardPositionsTable } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardPositionsTable'
import {
  dashboardPositionSortDirectionAtom,
  dashboardExpandedPositionRowsAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardPositionsTable.atoms'

export function usePositionTableState() {
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const expanded = useAtomValue(dashboardExpandedPositionRowsAtom)
  const { setExpanded, sort: onSort } = useDashboardPositionsTable()
  return { expanded, onSort, setExpanded, sortDir, sortKey }
}

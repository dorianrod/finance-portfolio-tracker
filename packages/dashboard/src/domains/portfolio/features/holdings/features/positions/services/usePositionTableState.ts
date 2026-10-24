import { dashboardExpandedPositionRowsAtom } from '@/domains/portfolio/shared/stores/dashboardPositionsTable.atoms'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

export function usePositionTableState() {
  const [expanded, setExpanded] = useAtom(dashboardExpandedPositionRowsAtom)
  return useMemo(() => ({ expanded, setExpanded }), [expanded, setExpanded])
}

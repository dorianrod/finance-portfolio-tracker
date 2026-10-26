import { useAtom } from 'jotai'
import { useMemo } from 'react'

import { dashboardExpandedPositionRowsAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable.atoms'

export function usePositionTableState() {
  const [expanded, setExpanded] = useAtom(dashboardExpandedPositionRowsAtom)
  return useMemo(() => ({ expanded, setExpanded }), [expanded, setExpanded])
}

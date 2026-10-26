import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/shared/stores/dashboardDiversification.atoms'

export function useDashboardDiversificationPositions() {
  const setPositionsOpen = useSetAtom(dashboardDiversificationPositionsOpenAtom)

  const togglePositions = useCallback(
    () => setPositionsOpen((open) => !open),
    [setPositionsOpen],
  )
  const closePositions = useCallback(
    () => setPositionsOpen(false),
    [setPositionsOpen],
  )

  return useMemo(
    () => ({ closePositions, togglePositions }),
    [closePositions, togglePositions],
  )
}

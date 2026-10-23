import { useCallback, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { dashboardAllocationPositionsOpenAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'

export function useDashboardAllocationPositions() {
  const setPositionsOpen = useSetAtom(dashboardAllocationPositionsOpenAtom)

  const togglePositions = useCallback(
    () => setPositionsOpen((open) => !open),
    [setPositionsOpen],
  )
  const closePositions = useCallback(() => setPositionsOpen(false), [setPositionsOpen])

  return useMemo(
    () => ({ closePositions, togglePositions }),
    [closePositions, togglePositions],
  )
}

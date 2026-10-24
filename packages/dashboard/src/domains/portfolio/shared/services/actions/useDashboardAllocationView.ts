import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { dashboardAllocationViewAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'

export function useDashboardAllocationView() {
  const setAllocationView = useSetAtom(dashboardAllocationViewAtom)

  return useMemo(() => ({ setAllocationView }), [setAllocationView])
}

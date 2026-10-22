import { useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { dashboardAllocationViewAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'

export function useDashboardAllocationView() {
  const setAllocationView = useSetAtom(dashboardAllocationViewAtom)

  return useMemo(() => ({ setAllocationView }), [setAllocationView])
}

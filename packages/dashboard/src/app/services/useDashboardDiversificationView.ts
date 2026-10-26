import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { dashboardDiversificationViewAtom } from '@/app/stores/dashboardDiversification.atoms'

export function useDashboardDiversificationView() {
  const setDiversificationView = useSetAtom(dashboardDiversificationViewAtom)

  return useMemo(() => ({ setDiversificationView }), [setDiversificationView])
}

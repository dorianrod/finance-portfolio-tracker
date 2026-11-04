import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { dashboardDiversificationViewAtom } from '@/domains/portfolio/features/diversification/shared/stores/dashboardDiversification.atoms'

export function useDashboardDiversificationView() {
  const setDiversificationView = useSetAtom(dashboardDiversificationViewAtom)

  return useMemo(() => ({ setDiversificationView }), [setDiversificationView])
}

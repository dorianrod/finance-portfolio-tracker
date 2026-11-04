import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

export function useOverviewNavigation() {
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)

  const navigateTo = useCallback(
    (tab: AnalysisTab) => setActiveTab(tab),
    [setActiveTab],
  )

  return useMemo(() => ({ navigateTo }), [navigateTo])
}

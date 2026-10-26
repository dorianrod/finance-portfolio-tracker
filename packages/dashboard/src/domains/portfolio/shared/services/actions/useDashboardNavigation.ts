import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsViewAtom'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'

export function useDashboardNavigation() {
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  const setHoldingsView = useSetAtom(dashboardHoldingsViewAtom)

  const navigateTo = useCallback(
    (tab: AnalysisTab) => setActiveTab(tab),
    [setActiveTab],
  )

  return useMemo(
    () => ({ navigateTo, setHoldingsView }),
    [navigateTo, setHoldingsView],
  )
}

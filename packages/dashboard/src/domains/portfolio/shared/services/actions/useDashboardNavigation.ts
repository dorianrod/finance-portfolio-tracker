import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  type AnalysisTab,
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'

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

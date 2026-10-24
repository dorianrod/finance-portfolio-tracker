import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  type AnalysisTab,
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/shared/stores/dashboardUnderlyingHoldings.atoms'

export function useDashboardNavigation() {
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  const setHoldingsView = useSetAtom(dashboardHoldingsViewAtom)
  const setUnderlyingQuery = useSetAtom(dashboardUnderlyingQueryAtom)

  const navigateTo = useCallback(
    (tab: AnalysisTab) => setActiveTab(tab),
    [setActiveTab],
  )
  const openCompleteHoldings = useCallback(
    (fundName: string) => {
      setUnderlyingQuery(fundName)
      setHoldingsView('underlying')
      setActiveTab('holdings')
    },
    [setActiveTab, setHoldingsView, setUnderlyingQuery],
  )

  return useMemo(
    () => ({ navigateTo, openCompleteHoldings, setHoldingsView }),
    [navigateTo, openCompleteHoldings, setHoldingsView],
  )
}

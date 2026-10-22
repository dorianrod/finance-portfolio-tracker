import { useCallback, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
  type AnalysisTab,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardNavigation.atoms'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardUnderlyingHoldings.atoms'

export function useDashboardNavigation() {
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  const setHoldingsView = useSetAtom(dashboardHoldingsViewAtom)
  const setUnderlyingQuery = useSetAtom(dashboardUnderlyingQueryAtom)

  const navigateTo = useCallback(
    (tab: AnalysisTab) => setActiveTab(tab),
    [setActiveTab],
  )
  const openCompleteHoldings = useCallback((fundName: string) => {
    setUnderlyingQuery(fundName)
    setHoldingsView('underlying')
    setActiveTab('holdings')
  }, [setActiveTab, setHoldingsView, setUnderlyingQuery])

  return useMemo(
    () => ({ navigateTo, openCompleteHoldings, setHoldingsView }),
    [navigateTo, openCompleteHoldings, setHoldingsView],
  )
}

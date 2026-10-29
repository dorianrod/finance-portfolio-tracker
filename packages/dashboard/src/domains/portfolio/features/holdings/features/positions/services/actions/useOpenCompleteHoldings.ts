import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

export function useOpenCompleteHoldings() {
  const setUnderlyingQuery = useSetAtom(dashboardUnderlyingQueryAtom)
  const setHoldingsView = useSetAtom(dashboardHoldingsViewAtom)
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  return useCallback(
    (fundName: string) => {
      setUnderlyingQuery(fundName)
      setHoldingsView('underlying')
      setActiveTab('holdings')
    },
    [setUnderlyingQuery, setHoldingsView, setActiveTab],
  )
}

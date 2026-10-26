import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'

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

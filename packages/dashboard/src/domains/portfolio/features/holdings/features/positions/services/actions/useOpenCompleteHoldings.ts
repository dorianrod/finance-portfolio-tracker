import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreview.atoms'
import { dashboardUnderlyingQueryAtom } from '@/domains/portfolio/features/holdings/shared/stores/holdingsSearch.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

export function useOpenCompleteHoldings() {
  const setPreview = useSetAtom(positionPreviewAtom)
  const setUnderlyingQuery = useSetAtom(dashboardUnderlyingQueryAtom)
  const setHoldingsView = useSetAtom(dashboardHoldingsViewAtom)
  const setActiveTab = useSetAtom(dashboardActiveTabAtom)
  return useCallback(
    (fundName: string) => {
      setPreview(null)
      setUnderlyingQuery(fundName)
      setHoldingsView('underlying')
      setActiveTab('holdings')
    },
    [setPreview, setUnderlyingQuery, setHoldingsView, setActiveTab],
  )
}

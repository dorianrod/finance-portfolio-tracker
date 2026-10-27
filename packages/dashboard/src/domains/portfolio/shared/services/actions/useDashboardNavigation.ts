// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; This common navigation action serves overview links and shell routing to the other portfolio capabilities. See SHARED_OWNERSHIP_AUDIT.md.
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

import { useAtomValue } from 'jotai'
import { lazy } from 'react'

import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders/dashboardTabLoaders'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'
export function DashboardHoldings() {
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  return (
    <ViewNavigation.Panel value={holdingsView}>
      {holdingsView === 'positions' ? (
        <PositionsPage />
      ) : (
        <FundLookThroughPage />
      )}
    </ViewNavigation.Panel>
  )
}
const PositionsPage = lazy(DASHBOARD_TAB_LOADERS.holdings)
const FundLookThroughPage = lazy(DASHBOARD_TAB_LOADERS.fundLookThrough)

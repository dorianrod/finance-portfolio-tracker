import { useAtomValue } from 'jotai'
import { lazy } from 'react'

import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders/dashboardTabLoaders'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

import { DashboardPanel } from './DashboardPanel.feature'

export function DashboardHoldings() {
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  return (
    <>
      <DashboardPanel active={holdingsView === 'positions'}>
        {POSITIONS}
      </DashboardPanel>
      <DashboardPanel active={holdingsView === 'underlying'}>
        {UNDERLYING}
      </DashboardPanel>
    </>
  )
}
const PositionsPage = lazy(DASHBOARD_TAB_LOADERS.holdings)
const FundLookThroughPage = lazy(DASHBOARD_TAB_LOADERS.fundLookThrough)
const POSITIONS = (
  <ViewNavigation.Panel value="positions">
    <PositionsPage />
  </ViewNavigation.Panel>
)
const UNDERLYING = (
  <ViewNavigation.Panel value="underlying">
    <FundLookThroughPage />
  </ViewNavigation.Panel>
)

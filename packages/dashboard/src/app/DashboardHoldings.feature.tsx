import { useAtomValue } from 'jotai'
import { lazy } from 'react'

import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

import type { DashboardViewModel } from './types/dashboardViewModel.type'

const PositionsTable = lazy(DASHBOARD_TAB_LOADERS.holdings)
const FundLookThroughTab = lazy(DASHBOARD_TAB_LOADERS.fundLookThrough)

export function DashboardHoldings({
  dashboard,
}: {
  dashboard: DashboardViewModel
}) {
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const {
    currentPositions,
    fundData,
    periodEndFundHoldings,
    tableData,
    useGroupedPositionsTable,
  } = dashboard
  return (
    <ViewNavigation.Panel value={holdingsView}>
      {holdingsView === 'positions' ? (
        <PositionsTable
          data={tableData}
          fundStatuses={fundData.statuses}
          grouping={useGroupedPositionsTable ? 'account-type' : 'flat'}
        />
      ) : (
        <FundLookThroughTab
          positions={currentPositions}
          holdings={periodEndFundHoldings}
        />
      )}
    </ViewNavigation.Panel>
  )
}

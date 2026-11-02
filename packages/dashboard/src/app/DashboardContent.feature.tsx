import { useAtomValue } from 'jotai'
import { lazy } from 'react'

import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders/dashboardTabLoaders'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'

import { DashboardHoldings } from './DashboardHoldings.feature'

export function DashboardContent() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  return (
    <>
      {activeTab === 'overview' && <OverviewPage />}
      {activeTab === 'wealth' && <WealthPage />}
      {activeTab === 'performance' && <PerformancePage />}
      {activeTab === 'diversification' && <DiversificationCharts />}
      {activeTab === 'holdings' && <DashboardHoldings />}
      {activeTab === 'quality' && <DataQualityTab />}
    </>
  )
}
const OverviewPage = lazy(DASHBOARD_TAB_LOADERS.overview)
const WealthPage = lazy(DASHBOARD_TAB_LOADERS.wealth)
const PerformancePage = lazy(DASHBOARD_TAB_LOADERS.performance)
const DiversificationCharts = lazy(DASHBOARD_TAB_LOADERS.diversification)
const DataQualityTab = lazy(DASHBOARD_TAB_LOADERS.quality)

import { useAtomValue } from 'jotai'
import { lazy } from 'react'

import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders/dashboardTabLoaders'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'

import { DashboardHoldings } from './DashboardHoldings.feature'
import { DashboardPanel } from './DashboardPanel.feature'

export function DashboardContent() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  return (
    <>
      <DashboardPanel active={activeTab === 'overview'}>
        {OVERVIEW}
      </DashboardPanel>
      <DashboardPanel active={activeTab === 'wealth'}>{WEALTH}</DashboardPanel>
      <DashboardPanel active={activeTab === 'performance'}>
        {PERFORMANCE}
      </DashboardPanel>
      <DashboardPanel active={activeTab === 'diversification'}>
        {DIVERSIFICATION}
      </DashboardPanel>
      <DashboardPanel active={activeTab === 'holdings'}>
        {HOLDINGS}
      </DashboardPanel>
      <DashboardPanel active={activeTab === 'quality'}>
        {QUALITY}
      </DashboardPanel>
    </>
  )
}
const OverviewPage = lazy(DASHBOARD_TAB_LOADERS.overview)
const WealthPage = lazy(DASHBOARD_TAB_LOADERS.wealth)
const PerformancePage = lazy(DASHBOARD_TAB_LOADERS.performance)
const DiversificationCharts = lazy(DASHBOARD_TAB_LOADERS.diversification)
const DataQualityTab = lazy(DASHBOARD_TAB_LOADERS.quality)

const OVERVIEW = <OverviewPage />
const WEALTH = <WealthPage />
const PERFORMANCE = <PerformancePage />
const DIVERSIFICATION = <DiversificationCharts />
const HOLDINGS = <DashboardHoldings />
const QUALITY = <DataQualityTab />

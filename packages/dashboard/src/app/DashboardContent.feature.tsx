import { useAtomValue } from 'jotai'
import { lazy } from 'react'

import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders/dashboardTabLoaders'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'

import { DashboardHoldings } from './DashboardHoldings.feature'
import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardContent({
  dashboard,
}: {
  dashboard: DashboardViewModel
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const {
    accountTypeData,
    currentPositions,
    displayedAnnualIncomeSavings,
    displayedHistory,
    displayedTypeHistory,
    fundData,
    globalTri,
    irrStatus,
    latestAccountPositions,
    monthlyOps,
    overviewComparison,
    passiveIncome,
    performance,
    periodEndFundHoldings,
    rawAllocationData,
    rawOperations,
    rawPositions,
    rollingThreeYearTriComparison,
    scopedManualPriceOverrides,
    scopedPipelineErrors,
    trailingIncome,
    trailingSavings,
    trailingYearComparison,
    typeHistory,
    wealthDrivers,
  } = dashboard
  return (
    <>
      {activeTab === 'overview' && (
        <OverviewTab
          comparison={overviewComparison}
          rollingThreeYearTri={rollingThreeYearTriComparison}
          irrStatus={irrStatus}
        />
      )}
      {activeTab === 'wealth' && (
        <WealthTab
          history={displayedHistory}
          accountTypeData={accountTypeData}
          accountTypeHistory={displayedTypeHistory}
          accountTypes={typeHistory.accountTypes}
          typeCategories={typeHistory.typeCategories}
          savings={trailingSavings}
          monthlyOps={monthlyOps}
          drivers={wealthDrivers}
          trailingYearComparison={trailingYearComparison}
          annualIncomeSavings={displayedAnnualIncomeSavings}
        />
      )}
      {activeTab === 'performance' && (
        <PerformanceTab
          history={displayedHistory}
          passiveIncome={passiveIncome}
          rawPositions={rawPositions}
          rawOperations={rawOperations}
          accountFilters={filters.accounts}
          accountTypeFilters={filters.accountTypes}
          dateFrom={filters.dateFrom}
          performance={performance}
          income={trailingIncome}
          globalTri={globalTri}
          irrStatus={irrStatus}
        />
      )}
      {activeTab === 'diversification' && (
        <DiversificationCharts
          positions={currentPositions}
          rawPositions={rawPositions}
          fundHoldings={periodEndFundHoldings}
          fundHoldingsHistory={fundData.history}
          accountFilters={filters.accounts}
          accountTypeFilters={filters.accountTypes}
          rawData={rawAllocationData}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
        />
      )}
      {activeTab === 'holdings' && <DashboardHoldings dashboard={dashboard} />}
      {activeTab === 'quality' && (
        <DataQualityTab
          positions={latestAccountPositions}
          errors={scopedPipelineErrors}
          manualPriceOverrides={scopedManualPriceOverrides}
          fundStatuses={fundData.statuses}
          fundReport={fundData.report}
          fundHoldings={fundData.holdings}
          fundSnapshots={fundData.snapshots}
          fundUnresolved={fundData.unresolved}
          rawData={rawAllocationData}
        />
      )}
    </>
  )
}

const OverviewTab = lazy(DASHBOARD_TAB_LOADERS.overview)
const WealthTab = lazy(DASHBOARD_TAB_LOADERS.wealth)
const PerformanceTab = lazy(DASHBOARD_TAB_LOADERS.performance)
const DiversificationCharts = lazy(DASHBOARD_TAB_LOADERS.diversification)
const DataQualityTab = lazy(DASHBOARD_TAB_LOADERS.quality)

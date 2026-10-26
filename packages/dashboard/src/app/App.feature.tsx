import { useAtomValue } from 'jotai'
import { lazy, Suspense } from 'react'

import { DashboardLoadState } from '@/app/DashboardLoadState.state'
import { DashboardPanelErrorBoundary } from '@/app/DashboardPanelErrorBoundary.view'
import { DASHBOARD_TAB_LOADERS } from '@/app/routing/dashboardTabLoaders'
import { useDashboardViewModel } from '@/app/services/useDashboardViewModel'
import { AllocationViewToggle } from '@/domains/portfolio/features/allocation/components/AllocationViewToggle.feature'
import { FilterChipBar } from '@/domains/portfolio/features/allocation/components/FilterChipBar.feature'
import {
  type HoldingsView,
  HoldingsViewTabs,
} from '@/domains/portfolio/features/holdings/components/HoldingsViewTabs.feature'
import { OverviewPeriodFilter } from '@/domains/portfolio/features/overview/pages/OverviewPeriodFilter.feature'
import {
  ActiveFilterSummary,
  FilterButton,
  FilterPanel,
  ResetFiltersButton,
} from '@/domains/portfolio/shared/components/filters/FilterBar.feature'
import {
  AnalysisReliabilityKpi,
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
} from '@/domains/portfolio/shared/components/quality/AnalysisReliabilityKpi.feature'
import {
  filterSummaries,
  filterVisibilityForTab,
} from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import { filterSummariesForTab } from '@/domains/portfolio/shared/helpers/filters/portfolioFilterScopes'
import { dashboardAllocationFilterAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import {
  type AnalysisTab,
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

import { DashboardHeader } from './DashboardHeader.feature'
import { DashboardNavigation } from './DashboardNavigation.feature'
import { DashboardPanelFallback } from './DashboardPanelFallback.view'

const OverviewTab = lazy(DASHBOARD_TAB_LOADERS.overview)
const WealthTab = lazy(DASHBOARD_TAB_LOADERS.wealth)
const PerformanceTab = lazy(DASHBOARD_TAB_LOADERS.performance)
const AllocationCharts = lazy(DASHBOARD_TAB_LOADERS.allocation)
const PositionsTable = lazy(DASHBOARD_TAB_LOADERS.holdings)
const FundLookThroughTab = lazy(DASHBOARD_TAB_LOADERS.fundLookThrough)
const DataQualityTab = lazy(DASHBOARD_TAB_LOADERS.quality)

const TAB_COPY: Record<AnalysisTab, { title: string; description: string }> = {
  overview: {
    title: i18n.t('ui.app.portfolioOverview'),
    description: i18n.t(
      'ui.app.currentPositionRecentChangeDriversAndTheMainSignals',
    ),
  },
  wealth: {
    title: i18n.t('ui.app.wealthCashFlow'),
    description: i18n.t(
      'ui.app.howContributionsAndMarketPerformanceBuiltThePortfolioOver',
    ),
  },
  performance: {
    title: i18n.t('ui.app.performancePassiveIncome'),
    description: i18n.t(
      'ui.app.returnsRealizedOutcomesAndRecurringPassiveIncome',
    ),
  },
  allocation: {
    title: i18n.t('ui.app.diversification'),
    description: i18n.t(
      'ui.app.currentExposuresConcentrationAndHowThePortfolioMixIs',
    ),
  },
  holdings: {
    title: i18n.t('ui.app.holdings'),
    description: i18n.t(
      'ui.app.inspectHeldPositionsAndTheirUnderlyingEconomicExposure',
    ),
  },
  quality: {
    title: i18n.t('ui.app.dataQuality'),
    description: i18n.t(
      'ui.app.aFocusedReviewOfPipelinePricingClassificationAndLook',
    ),
  },
}

const HOLDINGS_COPY: Record<
  HoldingsView,
  { title: string; description: string }
> = {
  positions: {
    title: i18n.t('ui.app.positions'),
    description: i18n.t(
      'ui.app.inspectEveryHoldingTransactionAndPositionLevelResult',
    ),
  },
  underlying: {
    title: i18n.t('ui.app.underlyingExposure'),
    description: i18n.t(
      'ui.app.reviewIdentifiedEconomicExposureThroughEtfsAndFundsGrouped',
    ),
  },
}

export default function App() {
  const formatDate = useFormatDate()
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const allocationFilter = useAtomValue(dashboardAllocationFilterAtom)
  const {
    accountFilterLabels,
    accountTypeData,
    currentPositions,
    demoPresetActive,
    demoPresetSelection,
    displayedAnnualIncomeSavings,
    displayedHistory,
    displayedTypeHistory,
    loadState,
    fundData,
    globalTri,
    irrScopeLabel,
    irrStatus,
    latestAccountPositions,
    monthlyOps,
    overviewComparison,
    passiveIncome,
    performance,
    periodEndFundHoldings,
    pipelineErrorsLoading,
    qualitySummary,
    rawAllocationData,
    rawOperations,
    rawPositions,
    rollingThreeYearTriComparison,
    scopedFundQuality,
    scopedManualPriceOverrides,
    scopedPipelineErrors,
    tableData,
    trailingIncome,
    trailingSavings,
    trailingYearComparison,
    typeHistory,
    useGroupedPositionsTable,
    wealthDrivers,
  } = useDashboardViewModel()
  const {
    classificationMappedValue,
    classificationMetricTone,
    classificationReliabilityPct,
    diversificationQualityTheme,
    diversificationReliabilityTone,
    hasFundValidationError,
    hasPipelineError,
    identifiedFundValue,
    overviewQualityTheme,
    overviewReliabilityTone,
    portfolioDataStatus,
    portfolioDataTone,
    qualityCount,
    scopedPipelineErrorCount,
    scopedPipelineWarningCount,
    underlyingMetricTone,
    underlyingReliabilityPct,
  } = qualitySummary
  const copy =
    activeTab === 'holdings' ? HOLDINGS_COPY[holdingsView] : TAB_COPY[activeTab]
  const filterVisibility = filterVisibilityForTab(activeTab, holdingsView)
  const activeFilterSummaries = filterSummaries(
    filters,
    accountFilterLabels,
    filterVisibility,
    (date) => formatDate(date, { style: 'isoDate' }),
  )
  const visibleFilterSummaries = filterSummariesForTab(
    activeFilterSummaries,
    activeTab,
  )
  const showPipelineReliability =
    activeTab !== 'overview' &&
    activeTab !== 'allocation' &&
    activeTab !== 'quality' &&
    !(activeTab === 'holdings' && holdingsView === 'underlying')
  const showUnderlyingReliability =
    activeTab === 'holdings' && holdingsView === 'underlying'
  const showResetFilters =
    activeFilterSummaries.length > 0 ||
    (activeTab === 'allocation' && allocationFilter !== null)
  const showAllocationFilter =
    activeTab === 'allocation' && allocationFilter !== null
  const showOverviewPeriodFilter =
    activeTab === 'overview' && overviewComparison !== null

  return (
    <ViewNavigation>
      <div className="min-h-screen">
        <div className="p-4 sm:p-6">
          <div className="mx-auto max-w-screen-2xl">
            <DashboardHeader />

            <DashboardLoadState
              state={loadState}
              onRetry={() => window.location.reload()}
            >
              <DashboardNavigation
                activeTab={activeTab}
                hasFundValidationError={hasFundValidationError}
                hasPipelineError={hasPipelineError}
                qualityCount={qualityCount}
              />

              {activeTab === 'holdings' && <HoldingsViewTabs />}

              <div className="mb-6">
                <Surface variant="sectionEnd">
                  <Inline
                    as="div"
                    align="start"
                    justify="between"
                    gap="relaxed"
                    inset="spacious"
                  >
                    <Layout>
                      <Text as="h2" variant="statistic" tone="default">
                        {copy.title}
                      </Text>
                      {showPipelineReliability && (
                        <Layout spaceBefore="default">
                          <PipelineReliabilityKpi
                            errorCount={scopedPipelineErrorCount}
                            warningCount={scopedPipelineWarningCount}
                            loading={pipelineErrorsLoading}
                            scope={{ account: 'filterable', period: 'range' }}
                          />
                        </Layout>
                      )}
                      {activeTab === 'overview' && (
                        <Layout spaceBefore="default">
                          <CombinedAnalysisReliabilityKpi
                            statusMetric={{
                              value: portfolioDataStatus,
                              metricLabel: i18n.t('ui.app.portfolioData'),
                              tone: portfolioDataTone,
                            }}
                            metrics={[
                              {
                                percentage: rawAllocationData.loading
                                  ? null
                                  : classificationReliabilityPct,
                                amount: classificationMappedValue,
                                metricLabel: i18n.t('ui.app.diversification'),
                                tone: classificationMetricTone,
                              },
                              {
                                percentage: scopedFundQuality.report
                                  ? underlyingReliabilityPct
                                  : null,
                                amount: identifiedFundValue,
                                metricLabel: i18n.t('ui.app.underlyingAssets'),
                                tone: underlyingMetricTone,
                              },
                            ]}
                            tone={overviewReliabilityTone}
                            tooltip={i18n.t(
                              'ui.app.aggregateReliabilityForPortfolioDataDiversificationMappingAndUnderlying',
                            )}
                            qualityTheme={overviewQualityTheme}
                            scope={{ account: 'filterable', period: 'mixed' }}
                          />
                        </Layout>
                      )}
                      {activeTab === 'allocation' && (
                        <Layout spaceBefore="default">
                          <CombinedAnalysisReliabilityKpi
                            metrics={[
                              {
                                percentage: rawAllocationData.loading
                                  ? null
                                  : classificationReliabilityPct,
                                amount: classificationMappedValue,
                                metricLabel: i18n.t('ui.app.diversification'),
                                tone: classificationMetricTone,
                              },
                              {
                                percentage: scopedFundQuality.report
                                  ? underlyingReliabilityPct
                                  : null,
                                amount: identifiedFundValue,
                                metricLabel: i18n.t('ui.app.underlyingAssets'),
                                tone: underlyingMetricTone,
                              },
                            ]}
                            tone={diversificationReliabilityTone}
                            tooltip={i18n.t(
                              'ui.app.aggregateReliabilityForDiversificationMappingAndUnderlyingAssetsLook',
                            )}
                            qualityTheme={diversificationQualityTheme}
                            scope={{
                              account: 'filterable',
                              period: 'latest',
                            }}
                          />
                        </Layout>
                      )}
                      {showUnderlyingReliability && (
                        <Layout spaceBefore="default">
                          <AnalysisReliabilityKpi
                            percentage={
                              scopedFundQuality.report
                                ? underlyingReliabilityPct
                                : null
                            }
                            amount={identifiedFundValue}
                            metricLabel={i18n.t('ui.app.underlyingAssets')}
                            tone={underlyingMetricTone}
                            tooltip={i18n.t(
                              'ui.app.reliabilityOfTheLookThroughDataUsedByThe',
                            )}
                            qualityTheme="lookthrough"
                            scope={{
                              account: 'filterable',
                              period: 'latest',
                            }}
                          />
                        </Layout>
                      )}
                      <Layout spaceBefore="default">
                        <Text as="p" variant="body" tone="subtle">
                          {copy.description}
                        </Text>
                      </Layout>
                    </Layout>
                    <Inline
                      as="div"
                      sizing="fixed"
                      align="center"
                      gap="default"
                    >
                      {activeTab === 'allocation' && <AllocationViewToggle />}
                      <FilterButton
                        activeCount={activeFilterSummaries.length}
                      />
                    </Inline>
                  </Inline>
                </Surface>
              </div>

              <ActiveFilterSummary items={visibleFilterSummaries}>
                {showOverviewPeriodFilter && (
                  <ActiveFilterSummary.Leading>
                    <OverviewPeriodFilter
                      windows={overviewComparison.windows}
                    />
                  </ActiveFilterSummary.Leading>
                )}
                {showAllocationFilter && <FilterChipBar />}
                {showResetFilters && (
                  <ActiveFilterSummary.Actions>
                    <ResetFiltersButton />
                  </ActiveFilterSummary.Actions>
                )}
              </ActiveFilterSummary>

              <FilterPanel
                visibility={filterVisibility}
                demoPresetSelection={demoPresetSelection}
                demoPresetActive={demoPresetActive}
              />

              <DashboardPanelErrorBoundary
                key={activeTab}
                onRetry={() => window.location.reload()}
              >
                <Suspense fallback={<DashboardPanelFallback />}>
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
                      irrScopeLabel={irrScopeLabel}
                    />
                  )}
                  {activeTab === 'allocation' && (
                    <AllocationCharts
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
                  {activeTab === 'holdings' && (
                    <ViewNavigation.Panel value={holdingsView}>
                      {holdingsView === 'positions' ? (
                        <PositionsTable
                          data={tableData}
                          fundStatuses={fundData.statuses}
                          grouping={
                            useGroupedPositionsTable ? 'account-type' : 'flat'
                          }
                        />
                      ) : (
                        <FundLookThroughTab
                          positions={currentPositions}
                          holdings={periodEndFundHoldings}
                        />
                      )}
                    </ViewNavigation.Panel>
                  )}
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
                </Suspense>
              </DashboardPanelErrorBoundary>
            </DashboardLoadState>
          </div>
        </div>
      </div>
    </ViewNavigation>
  )
}

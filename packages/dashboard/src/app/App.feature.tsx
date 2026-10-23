import i18n from '@/i18n/i18n'
import { lazy, Suspense } from "react";
import { useAtomValue } from "jotai";
import { DashboardPanelErrorBoundary } from "@/app/DashboardPanelErrorBoundary.view";
import {
  ActiveFilterSummary,
  FilterButton,
  FilterPanel,
  ResetFiltersButton,
} from "@/domains/portfolio/components/filters/FilterBar.feature";
import { AllocationViewToggle } from "@/domains/portfolio/components/allocation-charts/AllocationViewToggle.feature";
import { FilterChipBar } from "@/domains/portfolio/components/allocation-charts/FilterChipBar.feature";
import { OverviewPeriodFilter } from "@/domains/portfolio/pages/OverviewPeriodFilter.feature";
import {
  HoldingsViewTabs,
  type HoldingsView,
} from "@/domains/portfolio/components/holdings/HoldingsViewTabs.feature";
import {
  filterSummaries,
  filterVisibilityForTab,
} from "@/domains/portfolio/components/filters/helpers/filters/portfolioFilters";
import {
  AnalysisReliabilityKpi,
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
} from "@/domains/portfolio/components/quality/AnalysisReliabilityKpi.feature";
import {
  filterSummariesForTab,
} from "@/domains/portfolio/helpers/filters/portfolioFilterScopes";
import { useDashboardNavigation } from "@/domains/portfolio/pages/dashboard/services/actions/useDashboardNavigation";
import { useDashboardQuality } from "@/domains/portfolio/pages/dashboard/services/actions/useDashboardQuality";
import { useDashboardTheme, useDashboardThemeSync } from "@/domains/portfolio/pages/dashboard/services/actions/useDashboardTheme";
import { useDashboardViewModel } from "@/domains/portfolio/pages/dashboard/services/useDashboardViewModel";
import { dashboardFiltersAtom } from "@/domains/portfolio/pages/dashboard/stores/dashboardFilters.atoms";
import { dashboardAllocationFilterAtom } from "@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms";
import { dashboardThemeAtom } from "@/domains/portfolio/pages/dashboard/stores/dashboardTheme.atoms";
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
  type AnalysisTab,
} from "@/domains/portfolio/pages/dashboard/stores/dashboardNavigation.atoms";
import { SEMANTIC_STATUS_BADGE_CLASSES } from "@/shared/theme/semanticColors";
import { DASHBOARD_TAB_LOADERS, preloadDashboardTab } from "@/app/services/dashboardTabLoaders";

const OverviewTab = lazy(DASHBOARD_TAB_LOADERS.overview);
const WealthTab = lazy(DASHBOARD_TAB_LOADERS.wealth);
const PerformanceTab = lazy(DASHBOARD_TAB_LOADERS.performance);
const AllocationCharts = lazy(DASHBOARD_TAB_LOADERS.allocation);
const PositionsTable = lazy(DASHBOARD_TAB_LOADERS.holdings);
const FundLookThroughTab = lazy(DASHBOARD_TAB_LOADERS.fundLookThrough);
const DataQualityTab = lazy(DASHBOARD_TAB_LOADERS.quality);

const PRIMARY_TABS: Array<{
  id: Exclude<AnalysisTab, "quality">;
  label: string;
}> = [
  { id: "overview", label: i18n.t('ui.app.overview') },
  { id: "wealth", label: i18n.t('ui.app.wealthCashFlow') },
  { id: "performance", label: i18n.t('ui.app.performancePassiveIncome') },
  { id: "allocation", label: i18n.t('ui.app.diversification') },
  { id: "holdings", label: i18n.t('ui.app.holdings') },
];

const TAB_COPY: Record<AnalysisTab, { title: string; description: string }> = {
  overview: {
    title: i18n.t('ui.app.portfolioOverview'),
    description:
      i18n.t('ui.app.currentPositionRecentChangeDriversAndTheMainSignals'),
  },
  wealth: {
    title: i18n.t('ui.app.wealthCashFlow'),
    description:
      i18n.t('ui.app.howContributionsAndMarketPerformanceBuiltThePortfolioOver'),
  },
  performance: {
    title: i18n.t('ui.app.performancePassiveIncome'),
    description: i18n.t('ui.app.returnsRealizedOutcomesAndRecurringPassiveIncome'),
  },
  allocation: {
    title: i18n.t('ui.app.diversification'),
    description:
      i18n.t('ui.app.currentExposuresConcentrationAndHowThePortfolioMixIs'),
  },
  holdings: {
    title: i18n.t('ui.app.holdings'),
    description: i18n.t('ui.app.inspectHeldPositionsAndTheirUnderlyingEconomicExposure'),
  },
  quality: {
    title: i18n.t('ui.app.dataQuality'),
    description:
      i18n.t('ui.app.aFocusedReviewOfPipelinePricingClassificationAndLook'),
  },
};

const HOLDINGS_COPY: Record<HoldingsView, { title: string; description: string }> = {
  positions: {
    title: i18n.t('ui.app.positions'),
    description: i18n.t('ui.app.inspectEveryHoldingTransactionAndPositionLevelResult'),
  },
  underlying: {
    title: i18n.t('ui.app.underlyingExposure'),
    description:
      i18n.t('ui.app.reviewIdentifiedEconomicExposureThroughEtfsAndFundsGrouped'),
  },
};

interface PrimaryTabButtonProps {
  activeTab: AnalysisTab;
  onNavigate: (tab: AnalysisTab) => void;
  tab: (typeof PRIMARY_TABS)[number];
}

function PrimaryTabButton({ activeTab, onNavigate, tab }: PrimaryTabButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(tab.id)}
      onMouseEnter={() => preloadDashboardTab(tab.id)}
      onFocus={() => preloadDashboardTab(tab.id)}
      aria-current={activeTab === tab.id ? "page" : undefined}
      className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-accent text-content" : "border-transparent text-content-subtle hover:text-content-secondary"}`}
    >
      {tab.label}
    </button>
  );
}

function DashboardPanelFallback() {
  return (
    <div className="mb-6 rounded-card border border-border bg-surface/50 p-8 text-center text-sm text-content-subtle">

      {i18n.t('ui.app.loadingAnalysis')}
    </div>
  );
}

function DashboardHeader() {
  const theme = useAtomValue(dashboardThemeAtom);
  const { toggleTheme } = useDashboardTheme();
  useDashboardThemeSync();

  return (
    <header className="mb-5 flex items-start gap-4">
      <div>
        <h1 className="text-2xl font-bold text-content">{i18n.t('ui.app.portfolio')}</h1>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={theme === "dark"}
        aria-label={theme === "dark"
          ? i18n.t('ui.app.switchToLightMode')
          : i18n.t('ui.app.switchToDarkMode')}
        className="ml-auto rounded-control border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-content-muted transition-colors hover:bg-surface-raised hover:text-content-secondary"
      >
        {theme === "dark" ? i18n.t('ui.app.lightMode') : i18n.t('ui.app.darkMode')}
      </button>
    </header>
  );
}

function DashboardNavigation({
  activeTab,
  hasFundValidationError,
  hasPipelineError,
  qualityCount,
}: {
  activeTab: AnalysisTab;
  hasFundValidationError: boolean;
  hasPipelineError: boolean;
  qualityCount: number;
}) {
  const { navigateTo } = useDashboardNavigation();
  const { openQualityOverview } = useDashboardQuality();

  return (
    <nav
      className="mb-5 flex overflow-x-auto border-b border-border"
      aria-label={i18n.t('ui.app.portfolioAnalyses')}
    >
      {PRIMARY_TABS.map((tab) => (
        <PrimaryTabButton key={tab.id} activeTab={activeTab} onNavigate={navigateTo} tab={tab} />
      ))}
      <button
        type="button"
        onClick={openQualityOverview}
        onMouseEnter={() => preloadDashboardTab("quality")}
        onFocus={() => preloadDashboardTab("quality")}
        aria-current={activeTab === "quality" ? "page" : undefined}
        className={`ml-auto flex shrink-0 items-center gap-2 border-b-2 border-l border-l-border px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === "quality" ? "border-b-accent text-content" : "border-b-transparent text-content-subtle hover:text-content-secondary"}`}
      >

        {i18n.t('ui.app.dataQuality')}
        {qualityCount > 0 && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${hasPipelineError || hasFundValidationError ? SEMANTIC_STATUS_BADGE_CLASSES.critical : SEMANTIC_STATUS_BADGE_CLASSES.warning}`}
          >
            {qualityCount}
          </span>
        )}
      </button>
    </nav>
  );
}

export default function App() {
  const activeTab = useAtomValue(dashboardActiveTabAtom);
  const filters = useAtomValue(dashboardFiltersAtom);
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom);
  const allocationFilter = useAtomValue(dashboardAllocationFilterAtom);
  const {
    accountFilterLabels,
    accountTypeData,
    currentPositions,
    demoPresetActive,
    demoPresetSelection,
    displayedAnnualIncomeSavings,
    displayedHistory,
    displayedTypeHistory,
    error,
    fundData,
    globalTri,
    irrScopeLabel,
    irrStatus,
    latestAccountPositions,
    loading,
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
  } = useDashboardViewModel();
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
  } = qualitySummary;
  const copy = activeTab === "holdings" ? HOLDINGS_COPY[holdingsView] : TAB_COPY[activeTab];
  const filterVisibility = filterVisibilityForTab(activeTab, holdingsView);
  const activeFilterSummaries = filterSummaries(
    filters,
    accountFilterLabels,
    filterVisibility,
  );
  const visibleFilterSummaries = filterSummariesForTab(
    activeFilterSummaries,
    activeTab,
  );
  const dashboardReady = !loading && !error;
  const showPipelineReliability = activeTab !== "overview"
    && activeTab !== "allocation"
    && activeTab !== "quality"
    && !(activeTab === "holdings" && holdingsView === "underlying");
  const showUnderlyingReliability = activeTab === "holdings" && holdingsView === "underlying";
  const showResetFilters = activeFilterSummaries.length > 0
    || (activeTab === "allocation" && allocationFilter !== null);
  const showAllocationFilter = activeTab === "allocation" && allocationFilter !== null;

  return (
    <div className="min-h-screen bg-canvas p-4 text-content sm:p-6">
      <div className="mx-auto max-w-screen-2xl">
        <DashboardHeader />

        {loading && <p className="text-content-muted">{i18n.t('ui.app.loading')}</p>}
        {error && <p className="text-danger">{i18n.t('ui.app.error')} {error}</p>}
        {dashboardReady && (
          <>
            <DashboardNavigation
              activeTab={activeTab}
              hasFundValidationError={hasFundValidationError}
              hasPipelineError={hasPipelineError}
              qualityCount={qualityCount}
            />

            {activeTab === "holdings" && (
              <HoldingsViewTabs />
            )}

            <div className="mb-6 flex items-start justify-between gap-4 border-b border-border pb-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-content">
                  {copy.title}
                </h2>
                {showPipelineReliability && (
                  <div className="mt-2">
                    <PipelineReliabilityKpi
                      errorCount={scopedPipelineErrorCount}
                      warningCount={scopedPipelineWarningCount}
                      loading={pipelineErrorsLoading}
                      scope={{ account: "filterable", period: "range" }}
                    />
                  </div>
                )}
                {activeTab === "overview" && (
                  <div className="mt-2">
                    <CombinedAnalysisReliabilityKpi
                      statusMetric={{
                        value: portfolioDataStatus,
                        metricLabel: i18n.t('ui.app.portfolioData'),
                        tone: portfolioDataTone,
                      }}
                      metrics={[
                        {
                          percentage: rawAllocationData.loading ? null : classificationReliabilityPct,
                          amount: classificationMappedValue,
                          metricLabel: i18n.t('ui.app.diversification'),
                          tone: classificationMetricTone,
                        },
                        {
                          percentage: scopedFundQuality.report ? underlyingReliabilityPct : null,
                          amount: identifiedFundValue,
                          metricLabel: i18n.t('ui.app.underlyingAssets'),
                          tone: underlyingMetricTone,
                        },
                      ]}
                      tone={overviewReliabilityTone}
                      tooltip={i18n.t('ui.app.aggregateReliabilityForPortfolioDataDiversificationMappingAndUnderlying')}
                      qualityTheme={overviewQualityTheme}
                      scope={{ account: "filterable", period: "mixed" }}
                    />
                  </div>
                )}
                {activeTab === "allocation" && (
                  <div className="mt-2">
                    <CombinedAnalysisReliabilityKpi
                      metrics={[
                        {
                          percentage: rawAllocationData.loading ? null : classificationReliabilityPct,
                          amount: classificationMappedValue,
                          metricLabel: i18n.t('ui.app.diversification'),
                          tone: classificationMetricTone,
                        },
                        {
                          percentage: scopedFundQuality.report ? underlyingReliabilityPct : null,
                          amount: identifiedFundValue,
                          metricLabel: i18n.t('ui.app.underlyingAssets'),
                          tone: underlyingMetricTone,
                        },
                      ]}
                      tone={diversificationReliabilityTone}
                      tooltip={i18n.t('ui.app.aggregateReliabilityForDiversificationMappingAndUnderlyingAssetsLook')}
                      qualityTheme={diversificationQualityTheme}
                      scope={{ account: "filterable", period: "latest" }}
                    />
                  </div>
                )}
                {showUnderlyingReliability && (
                  <div className="mt-2">
                    <AnalysisReliabilityKpi
                      percentage={scopedFundQuality.report ? underlyingReliabilityPct : null}
                      amount={identifiedFundValue}
                      metricLabel={i18n.t('ui.app.underlyingAssets')}
                      tone={underlyingMetricTone}
                      tooltip={i18n.t('ui.app.reliabilityOfTheLookThroughDataUsedByThe')}
                      qualityTheme="lookthrough"
                      scope={{ account: "filterable", period: "latest" }}
                    />
                  </div>
                )}
                <p className="mt-2 text-sm text-content-subtle">{copy.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {activeTab === "allocation" && (
                  <AllocationViewToggle />
                )}
                <FilterButton
                  activeCount={activeFilterSummaries.length}
                />
              </div>
            </div>

            <ActiveFilterSummary
              items={visibleFilterSummaries}
              leading={activeTab === "overview" && overviewComparison ? (
                <OverviewPeriodFilter
                  windows={overviewComparison.windows}
                />
              ) : undefined}
              actions={showResetFilters
                ? <ResetFiltersButton />
                : undefined}
            >
              {showAllocationFilter && (
                <FilterChipBar />
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
                {activeTab === "overview" && (
                  <OverviewTab
                    comparison={overviewComparison}
                    rollingThreeYearTri={rollingThreeYearTriComparison}
                    irrStatus={irrStatus}
                  />
                )}
              {activeTab === "wealth" && (
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
              {activeTab === "performance" && (
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
              {activeTab === "allocation" && (
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
              {activeTab === "holdings" && (
                <div
                  id={`holdings-${holdingsView}-panel`}
                  role="region"
                  aria-labelledby={`holdings-${holdingsView}-tab`}
                >
                  {holdingsView === "positions" ? (
                    <PositionsTable
                      data={tableData}
                      fundStatuses={fundData.statuses}
                      grouping={useGroupedPositionsTable ? "account-type" : "flat"}
                    />
                  ) : (
                    <FundLookThroughTab
                      positions={currentPositions}
                      holdings={periodEndFundHoldings}
                    />
                  )}
                </div>
              )}
              {activeTab === "quality" && (
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
          </>
        )}
      </div>
    </div>
  );
}

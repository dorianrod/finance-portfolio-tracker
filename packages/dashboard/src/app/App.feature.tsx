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
} from "@/domains/portfolio/components/filters/filterBar.logic";
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

const loadOverviewTab = () =>
  import("@/domains/portfolio/pages/OverviewTab.feature").then((module) => ({ default: module.OverviewTab }));
const loadWealthTab = () =>
  import("@/domains/portfolio/pages/WealthTab.feature").then((module) => ({ default: module.WealthTab }));
const loadPerformanceTab = () =>
  import("@/domains/portfolio/pages/PerformanceTab.feature").then((module) => ({ default: module.PerformanceTab }));
const loadAllocationCharts = () =>
  import("@/domains/portfolio/components/allocation-charts/AllocationCharts.feature").then((module) => ({ default: module.AllocationCharts }));
const loadPositionsTable = () =>
  import("@/domains/portfolio/components/positions-table/PositionsTable.feature").then((module) => ({ default: module.PositionsTable }));
const loadFundLookThroughTab = () =>
  import("@/domains/portfolio/components/fund-holdings/FundLookThroughTab.feature").then((module) => ({ default: module.FundLookThroughTab }));
const loadDataQualityTab = () =>
  import("@/domains/portfolio/pages/DataQualityTab.feature").then((module) => ({ default: module.DataQualityTab }));

const OverviewTab = lazy(loadOverviewTab);
const WealthTab = lazy(loadWealthTab);
const PerformanceTab = lazy(loadPerformanceTab);
const AllocationCharts = lazy(loadAllocationCharts);
const PositionsTable = lazy(loadPositionsTable);
const FundLookThroughTab = lazy(loadFundLookThroughTab);
const DataQualityTab = lazy(loadDataQualityTab);

const TAB_PRELOADERS: Record<AnalysisTab, () => Promise<unknown>> = {
  overview: loadOverviewTab,
  wealth: loadWealthTab,
  performance: loadPerformanceTab,
  allocation: loadAllocationCharts,
  holdings: loadPositionsTable,
  quality: loadDataQualityTab,
};

function preloadTab(tab: AnalysisTab) {
  void TAB_PRELOADERS[tab]();
}

const PRIMARY_TABS: Array<{
  id: Exclude<AnalysisTab, "quality">;
  label: string;
}> = [
  { id: "overview", label: "Overview" },
  { id: "wealth", label: "Wealth & cash flow" },
  { id: "performance", label: "Performance & passive income" },
  { id: "allocation", label: "Diversification" },
  { id: "holdings", label: "Holdings" },
];

const TAB_COPY: Record<AnalysisTab, { title: string; description: string }> = {
  overview: {
    title: "Portfolio overview",
    description:
      "Current position, recent change drivers and the main signals to review.",
  },
  wealth: {
    title: "Wealth & cash flow",
    description:
      "How contributions and market performance built the portfolio over time.",
  },
  performance: {
    title: "Performance & passive income",
    description: "Returns, realized outcomes and recurring passive income.",
  },
  allocation: {
    title: "Diversification",
    description:
      "Current exposures, concentration and how the portfolio mix is evolving.",
  },
  holdings: {
    title: "Holdings",
    description: "Inspect held positions and their underlying economic exposure.",
  },
  quality: {
    title: "Data quality",
    description:
      "A focused review of pipeline, pricing, classification and look-through gaps.",
  },
};

const HOLDINGS_COPY: Record<HoldingsView, { title: string; description: string }> = {
  positions: {
    title: "Positions",
    description: "Inspect every holding, transaction and position-level result.",
  },
  underlying: {
    title: "Underlying exposure",
    description:
      "Review identified economic exposure through ETFs and funds, grouped by issuer and security.",
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
      onMouseEnter={() => preloadTab(tab.id)}
      onFocus={() => preloadTab(tab.id)}
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
      Loading analysis…
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
        <h1 className="text-2xl font-bold text-content">Portfolio</h1>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={theme === "dark"}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="ml-auto rounded-control border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-content-muted transition-colors hover:bg-surface-raised hover:text-content-secondary"
      >
        {theme === "dark" ? "Light mode" : "Dark mode"}
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
      aria-label="Portfolio analyses"
    >
      {PRIMARY_TABS.map((tab) => (
        <PrimaryTabButton key={tab.id} activeTab={activeTab} onNavigate={navigateTo} tab={tab} />
      ))}
      <button
        type="button"
        onClick={openQualityOverview}
        onMouseEnter={() => preloadTab("quality")}
        onFocus={() => preloadTab("quality")}
        aria-current={activeTab === "quality" ? "page" : undefined}
        className={`ml-auto flex shrink-0 items-center gap-2 border-b-2 border-l border-l-border px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === "quality" ? "border-b-accent text-content" : "border-b-transparent text-content-subtle hover:text-content-secondary"}`}
      >
        Data quality
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

        {loading && <p className="text-content-muted">Loading…</p>}
        {error && <p className="text-danger">Error: {error}</p>}
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
                        metricLabel: "Portfolio data",
                        tone: portfolioDataTone,
                      }}
                      metrics={[
                        {
                          percentage: rawAllocationData.loading ? null : classificationReliabilityPct,
                          amount: classificationMappedValue,
                          metricLabel: "Diversification",
                          tone: classificationMetricTone,
                        },
                        {
                          percentage: scopedFundQuality.report ? underlyingReliabilityPct : null,
                          amount: identifiedFundValue,
                          metricLabel: "Underlying assets",
                          tone: underlyingMetricTone,
                        },
                      ]}
                      tone={overviewReliabilityTone}
                      tooltip="Aggregate reliability for portfolio data, diversification mapping and underlying-assets look-through. The overall status follows the weakest indicator."
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
                          metricLabel: "Diversification",
                          tone: classificationMetricTone,
                        },
                        {
                          percentage: scopedFundQuality.report ? underlyingReliabilityPct : null,
                          amount: identifiedFundValue,
                          metricLabel: "Underlying assets",
                          tone: underlyingMetricTone,
                        },
                      ]}
                      tone={diversificationReliabilityTone}
                      tooltip="Aggregate reliability for diversification mapping and underlying-assets look-through. Each percentage keeps its own quality color; the overall status follows the weaker indicator."
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
                      metricLabel="Underlying assets"
                      tone={underlyingMetricTone}
                      tooltip="Reliability of the look-through data used by the underlying-assets view. The percentage uses the whole selected portfolio, including balances where look-through is not applicable."
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

import { lazy, Suspense, useMemo } from "react";
import { useData } from "@/domains/portfolio/apis/queries/useData";
import { usePortfolioHistory } from "@/domains/portfolio/apis/queries/usePortfolioHistory";
import { useCashHistory } from "@/domains/portfolio/apis/queries/useCashHistory";
import { useAllPositions } from "@/domains/portfolio/apis/queries/useAllPositions";
import { useErrors } from "@/domains/portfolio/apis/queries/useErrors";
import { useManualPriceOverrides } from "@/domains/portfolio/apis/queries/useManualPriceOverrides";
import {
  useFilteredPortfolioHistory,
} from "@/domains/portfolio/apis/queries/useFilteredPortfolioHistory";
import { useMonthlyOps } from "@/domains/portfolio/apis/queries/useMonthlyOps";
import { useSavingCapacity } from "@/domains/portfolio/apis/queries/useSavingCapacity";
import { usePassiveIncome } from "@/domains/portfolio/apis/queries/usePassiveIncome";
import { useAccountTypeHistory } from "@/domains/portfolio/apis/queries/useAccountTypeHistory";
import { useAnnualIncomeSavings } from "@/domains/portfolio/apis/queries/useAnnualIncomeSavings";
import { filterAnnualIncomeSavingsByPeriod } from "@/domains/portfolio/helpers/annualIncomeSavings.logic";
import { useRawIsinData } from "@/domains/portfolio/apis/queries/useRawIsinData";
import { useFundHoldingsData } from "@/domains/portfolio/apis/queries/useFundHoldings";
import {
  ActiveFilterSummary,
  FilterButton,
  FilterPanel,
  ResetFiltersButton,
} from "@/domains/portfolio/components/filters/FilterBar";
import { AllocationViewToggle } from "@/domains/portfolio/components/allocation-charts/AllocationViewToggle";
import { FilterChipBar } from "@/domains/portfolio/components/allocation-charts/FilterChipBar";
import { computeAllocationCoverageByAccount } from "@/domains/portfolio/components/allocation-charts/allocationCoverage.logic";
import { selectHistoricalFundHoldingsAtDate } from "@/domains/portfolio/components/allocation-charts/concentrationTrend.logic";
import { OverviewPeriodFilter } from "@/domains/portfolio/pages/OverviewPeriodFilter";
import { buildOverviewComparison, compareRollingThreeYearIrr } from "@/domains/portfolio/pages/overviewComparison.logic";
import { scopeFundQualityData } from "@/domains/portfolio/components/fund-holdings/fundQualityScope.logic";
import {
  HoldingsViewTabs,
  type HoldingsView,
} from "@/domains/portfolio/components/holdings/HoldingsViewTabs";
import type { Filters } from "@/domains/portfolio/types/filters";
import { buildPositionRows } from "@/domains/portfolio/helpers/positionHierarchy.logic";
import { FilterScopeProvider } from "@/domains/portfolio/components/filters/FilterScopeBadges";
import {
  clearFilterGroup,
  filterSummaries,
  filterVisibilityForTab,
} from "@/domains/portfolio/components/filters/filterBar.logic";
import {
  AnalysisReliabilityKpi,
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
} from "@/domains/portfolio/components/quality/AnalysisReliabilityKpi";
import { buildDashboardQualitySummary } from "@/domains/portfolio/pages/dashboard/helpers/mappers/buildDashboardQualitySummary";
import { buildDashboardSourceData } from "@/domains/portfolio/pages/dashboard/helpers/mappers/buildDashboardSourceData";
import {
  buildDemoPresetSelection,
  filterSummariesForTab,
  isDemoPresetActive,
  withoutOperationAndPeriodFilters,
  withoutOperationFilters,
} from "@/domains/portfolio/helpers/filters/portfolioFilterScopes";
import {
  useDashboardUi,
  type AnalysisTab,
} from "@/domains/portfolio/pages/dashboard/services/actions/useDashboardUi";
import {
  buildCumulativeWealthDrivers,
  computePerformanceSummary,
  computeTrailing12mYearOverYear,
  computeTrailing12mIncome,
  computeTrailing12mSavings,
  filterMonthlyOpsByAccounts,
  filterPointsByPeriod,
} from "@/domains/portfolio/components/portfolio-charts/portfolioCharts.logic";
import {
  applyPositionFilters,
  applyAccountFilterToHistory,
  buildAccountTypeBreakdown,
  scopeManualPriceOverrides,
  scopePipelineErrors,
  sortPositionsForTable,
} from "@/domains/portfolio/helpers/app.logic";
import { SEMANTIC_STATUS_BADGE_CLASSES } from "@/shared/format/semanticColors";

const loadOverviewTab = () =>
  import("@/domains/portfolio/pages/OverviewTab").then((module) => ({ default: module.OverviewTab }));
const loadWealthTab = () =>
  import("@/domains/portfolio/pages/WealthTab").then((module) => ({ default: module.WealthTab }));
const loadPerformanceTab = () =>
  import("@/domains/portfolio/pages/PerformanceTab").then((module) => ({ default: module.PerformanceTab }));
const loadAllocationCharts = () =>
  import("@/domains/portfolio/components/allocation-charts/AllocationCharts").then((module) => ({ default: module.AllocationCharts }));
const loadPositionsTable = () =>
  import("@/domains/portfolio/components/positions-table/PositionsTable").then((module) => ({ default: module.PositionsTable }));
const loadGroupedPositionsTable = () =>
  import("@/domains/portfolio/components/positions-table/PositionsTable").then((module) => ({ default: module.GroupedPositionsTable }));
const loadFundLookThroughTab = () =>
  import("@/domains/portfolio/components/fund-holdings/FundLookThroughTab").then((module) => ({ default: module.FundLookThroughTab }));
const loadDataQualityTab = () =>
  import("@/domains/portfolio/pages/DataQualityTab").then((module) => ({ default: module.DataQualityTab }));

const OverviewTab = lazy(loadOverviewTab);
const WealthTab = lazy(loadWealthTab);
const PerformanceTab = lazy(loadPerformanceTab);
const AllocationCharts = lazy(loadAllocationCharts);
const PositionsTable = lazy(loadPositionsTable);
const GroupedPositionsTable = lazy(loadGroupedPositionsTable);
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

function DashboardPanelFallback() {
  return (
    <div className="mb-6 rounded-card border border-border bg-surface/50 p-8 text-center text-sm text-content-subtle">
      Loading analysis…
    </div>
  );
}

export default function App() {
  const {
    positions,
    rawPositions,
    rawOperations,
    accountLabels,
    loading,
    error,
  } = useData();
  const { history } = usePortfolioHistory();
  const { cashHistory } = useCashHistory();
  const allPositionRows = useAllPositions();
  const { errors: pipelineErrors, loading: pipelineErrorsLoading } = useErrors();
  const { manualPriceOverrides } = useManualPriceOverrides();
  const allMonthlyOps = useMonthlyOps();
  const rawAllocationData = useRawIsinData();
  const fundData = useFundHoldingsData();
  const fundHoldings = fundData.holdings;
  const annualIncomeSavings = useAnnualIncomeSavings();

  const {
    activeTab,
    allocationFilter,
    allocationView,
    expandedPositionRows,
    expandedUnderlyingIssuers,
    filters,
    filtersOpen,
    handleSort,
    holdingsView,
    openCompleteHoldings,
    openDataQuality,
    openQualityOverview,
    resetAllFilters,
    selectedQualityTheme,
    setActiveTab,
    setAllocationFilter,
    setAllocationView,
    setExpandedPositionRows,
    setExpandedUnderlyingIssuers,
    setFilters,
    setFiltersOpen,
    setHoldingsView,
    setSelectedQualityTheme,
    setUnderlyingQuery,
    setUnderlyingSort,
    sortDir,
    sortKey,
    theme,
    toggleTheme,
    underlyingQuery,
    underlyingSort,
  } = useDashboardUi();

  const {
    accountFilterLabels,
    accountToType,
    allAccounts,
    allAccountTypes,
    allOperationTypes,
    enrichedHistory,
  } = useMemo(
    () => buildDashboardSourceData({
      accountLabels,
      cashHistory,
      history,
      positions,
    }),
    [accountLabels, cashHistory, history, positions],
  );

  const currentFilters = useMemo<Filters>(
    () => withoutOperationAndPeriodFilters(filters),
    [filters],
  );
  const latestAccountPositions = useMemo(
    () => applyPositionFilters(positions, currentFilters),
    [positions, currentFilters],
  );
  const positionsAtPeriodEnd = useMemo(
    () => buildPositionRows(rawOperations, rawPositions, filters.dateTo),
    [rawOperations, rawPositions, filters.dateTo],
  );
  const currentPositions = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, currentFilters),
    [positionsAtPeriodEnd, currentFilters],
  );
  const periodEndFundHoldings = useMemo(
    () => filters.dateTo
      ? selectHistoricalFundHoldingsAtDate(fundData.history, filters.dateTo)
      : fundHoldings,
    [filters.dateTo, fundData.history, fundHoldings],
  );
  const tableFiltered = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, filters),
    [positionsAtPeriodEnd, filters],
  );
  const periodPositions = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, withoutOperationFilters(filters)),
    [positionsAtPeriodEnd, filters],
  );
  const tableData = useMemo(
    () =>
      sortPositionsForTable(
        tableFiltered,
        filters.hideClosedPositions,
        allAccountTypes,
        sortKey,
        sortDir,
      ),
    [
      tableFiltered,
      filters.hideClosedPositions,
      allAccountTypes,
      sortKey,
      sortDir,
    ],
  );
  const PositionsTableVariant = allAccountTypes.length > 0
    ? GroupedPositionsTable
    : PositionsTable;

  const fallbackAccountHistory = useMemo(
    () =>
      applyAccountFilterToHistory(
        allPositionRows,
        enrichedHistory,
        filters.accounts,
      ),
    [allPositionRows, enrichedHistory, filters.accounts],
  );
  const filteredHistory = useFilteredPortfolioHistory(
    fallbackAccountHistory,
    filters.accounts,
  );
  const accountHistory = filteredHistory.history;
  const displayedHistory = useMemo(
    () =>
      filterPointsByPeriod(accountHistory, filters.dateFrom, filters.dateTo),
    [accountHistory, filters.dateFrom, filters.dateTo],
  );
  const globalTri = displayedHistory[displayedHistory.length - 1]?.tri ?? null;
  let irrStatus: "loading" | "error" | "ready" = "ready";
  if (filteredHistory.loading) irrStatus = "loading";
  else if (filteredHistory.error) irrStatus = "error";
  const irrScopeLabel =
    filteredHistory.isFiltered && irrStatus === "ready"
      ? "Selected accounts"
      : undefined;
  const demoPresetSelection = useMemo(() => {
    return buildDemoPresetSelection(allAccounts, filteredHistory.demoPresetAccounts);
  }, [allAccounts, filteredHistory.demoPresetAccounts]);
  const demoPresetActive = useMemo(
    () => isDemoPresetActive(filters.accounts, filteredHistory.demoPresetAccounts),
    [filteredHistory.demoPresetAccounts, filters.accounts],
  );

  const savingCapacity = useSavingCapacity(filters.accounts);
  const overviewComparison = useMemo(
    () => buildOverviewComparison({
      rawPositions,
      rawOperations,
      savingCapacity,
      fundHoldingsHistory: fundData.history,
      accountFilters: filters.accounts,
      accountTypeFilters: filters.accountTypes,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [
      rawPositions,
      rawOperations,
      savingCapacity,
      fundData.history,
      filters.accounts,
      filters.accountTypes,
      filters.dateFrom,
      filters.dateTo,
    ],
  );
  const rollingThreeYearTriComparison = useMemo(
    () => overviewComparison
      ? compareRollingThreeYearIrr(accountHistory, overviewComparison.windows)
      : { current: null, previous: null, delta: null, deltaPct: null },
    [accountHistory, overviewComparison],
  );
  const periodSavings = useMemo(
    () => filterPointsByPeriod(savingCapacity, filters.dateFrom, filters.dateTo),
    [savingCapacity, filters.dateFrom, filters.dateTo],
  );
  const trailingSavings = useMemo(
    () => computeTrailing12mSavings(savingCapacity, filters.dateFrom, filters.dateTo),
    [savingCapacity, filters.dateFrom, filters.dateTo],
  );
  const trailingYearComparison = useMemo(
    () => computeTrailing12mYearOverYear(savingCapacity, filters.dateTo),
    [savingCapacity, filters.dateTo],
  );
  const wealthDrivers = useMemo(
    () => buildCumulativeWealthDrivers(periodSavings),
    [periodSavings],
  );
  const monthlyOps = useMemo(
    () => filterMonthlyOpsByAccounts(allMonthlyOps, filters.accounts),
    [allMonthlyOps, filters.accounts],
  );
  const passiveIncome = usePassiveIncome(
    filters.accounts,
    filters.dateFrom,
    filters.dateTo,
  );
  const typeHistory = useAccountTypeHistory(filters.accounts);
  const displayedTypeHistory = useMemo(
    () =>
      filterPointsByPeriod(typeHistory.data, filters.dateFrom, filters.dateTo),
    [typeHistory.data, filters.dateFrom, filters.dateTo],
  );

  const accountTypeData = useMemo(
    () => buildAccountTypeBreakdown(currentPositions),
    [currentPositions],
  );
  const displayedAnnualIncomeSavings = useMemo(
    () => filterAnnualIncomeSavingsByPeriod(annualIncomeSavings, filters.dateFrom, filters.dateTo),
    [annualIncomeSavings, filters.dateFrom, filters.dateTo],
  );
  const asOfPerformance = useMemo(
    () => computePerformanceSummary(currentPositions),
    [currentPositions],
  );
  const periodPerformance = useMemo(
    () => computePerformanceSummary(periodPositions),
    [periodPositions],
  );
  const performance = useMemo(
    () => ({
      ...asOfPerformance,
      realizedNet: periodPerformance.realizedNet,
      realizedGross: periodPerformance.realizedGross,
    }),
    [asOfPerformance, periodPerformance],
  );
  const trailingIncome = useMemo(
    () =>
      computeTrailing12mIncome(currentPositions, displayedHistory.at(-1)?.date),
    [currentPositions, displayedHistory],
  );
  const coverage = useMemo(
    () =>
      rawAllocationData.loading
        ? []
        : computeAllocationCoverageByAccount(
            latestAccountPositions,
            rawAllocationData,
          ),
    [latestAccountPositions, rawAllocationData],
  );
  const scopedFundQuality = useMemo(
    () =>
      scopeFundQualityData(
        latestAccountPositions,
        fundData.holdings,
        fundData.statuses,
        fundData.snapshots,
        fundData.unresolved,
        fundData.report,
      ),
    [
      latestAccountPositions,
      fundData.holdings,
      fundData.statuses,
      fundData.snapshots,
      fundData.unresolved,
      fundData.report,
    ],
  );

  const pipelineQualityPositions = activeTab === "holdings" && holdingsView === "positions"
    ? tableFiltered
    : latestAccountPositions;
  const scopedPipelineErrors = useMemo(
    () => scopePipelineErrors(pipelineErrors, pipelineQualityPositions, filters),
    [pipelineErrors, pipelineQualityPositions, filters],
  );
  const scopedManualPriceOverrides = useMemo(
    () => scopeManualPriceOverrides(manualPriceOverrides, latestAccountPositions, filters),
    [manualPriceOverrides, latestAccountPositions, filters],
  );
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
  } = useMemo(
    () => buildDashboardQualitySummary({
      allocationLoading: rawAllocationData.loading,
      coverage,
      pipelineErrorsLoading,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    }),
    [
      rawAllocationData.loading,
      coverage,
      pipelineErrorsLoading,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    ],
  );
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

  return (
    <FilterScopeProvider filters={filters} accountLabels={accountFilterLabels}>
    <div className="min-h-screen bg-canvas p-4 text-content sm:p-6">
      <div className="mx-auto max-w-screen-2xl">
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

        {loading && <p className="text-content-muted">Loading…</p>}
        {error && <p className="text-danger">Error: {error}</p>}
        {!loading && !error && (
          <>
            <nav
              className="mb-5 flex overflow-x-auto border-b border-border"
              aria-label="Portfolio analyses"
            >
              {PRIMARY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => preloadTab(tab.id)}
                  onFocus={() => preloadTab(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-accent text-content" : "border-transparent text-content-subtle hover:text-content-secondary"}`}
                >
                  {tab.label}
                </button>
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

            {activeTab === "holdings" && (
              <HoldingsViewTabs value={holdingsView} onChange={setHoldingsView} />
            )}

            <div className="mb-6 flex items-start justify-between gap-4 border-b border-border pb-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-content">
                  {copy.title}
                </h2>
                {activeTab !== "overview" && activeTab !== "allocation" && activeTab !== "quality" && !(activeTab === "holdings" && holdingsView === "underlying") && (
                  <div className="mt-2">
                    <PipelineReliabilityKpi
                      errorCount={scopedPipelineErrorCount}
                      warningCount={scopedPipelineWarningCount}
                      loading={pipelineErrorsLoading}
                      onClick={() => openDataQuality("pipeline")}
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
                      onClick={() => openDataQuality(overviewQualityTheme)}
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
                      onClick={() => openDataQuality(diversificationQualityTheme)}
                      scope={{ account: "filterable", period: "latest" }}
                    />
                  </div>
                )}
                {activeTab === "holdings" && holdingsView === "underlying" && (
                  <div className="mt-2">
                    <AnalysisReliabilityKpi
                      percentage={scopedFundQuality.report ? underlyingReliabilityPct : null}
                      amount={identifiedFundValue}
                      metricLabel="Underlying assets"
                      tone={underlyingMetricTone}
                      tooltip="Reliability of the look-through data used by the underlying-assets view. The percentage uses the whole selected portfolio, including balances where look-through is not applicable."
                      onClick={() => openDataQuality("lookthrough")}
                      scope={{ account: "filterable", period: "latest" }}
                    />
                  </div>
                )}
                <p className="mt-2 text-sm text-content-subtle">{copy.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {activeTab === "allocation" && (
                  <AllocationViewToggle
                    value={allocationView}
                    onChange={setAllocationView}
                  />
                )}
                <FilterButton
                  activeCount={activeFilterSummaries.length}
                  open={filtersOpen}
                  onClick={() => setFiltersOpen(true)}
                />
              </div>
            </div>

            <ActiveFilterSummary
              items={visibleFilterSummaries}
              leading={activeTab === "overview" && overviewComparison ? (
                <OverviewPeriodFilter
                  windows={overviewComparison.windows}
                  onEdit={() => setFiltersOpen(true)}
                />
              ) : undefined}
              onRemove={(item) =>
                setFilters((current) => clearFilterGroup(current, item.key))
              }
              actions={activeFilterSummaries.length > 0 || (activeTab === "allocation" && allocationFilter !== null)
                ? <ResetFiltersButton onClick={resetAllFilters} />
                : undefined}
            >
              {activeTab === "allocation" && allocationFilter && (
                <FilterChipBar
                  filter={allocationFilter}
                  onRemove={() => setAllocationFilter(null)}
                />
              )}
            </ActiveFilterSummary>

            <FilterPanel
              allAccountTypes={allAccountTypes}
              accountToType={accountToType}
              allAccounts={allAccounts}
              accountLabels={accountFilterLabels}
              allOperationTypes={allOperationTypes}
              filters={filters}
              onChange={setFilters}
              visibility={filterVisibility}
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              onReset={resetAllFilters}
              demoPresetSelection={demoPresetSelection}
              demoPresetActive={demoPresetActive}
            />

            <Suspense fallback={<DashboardPanelFallback />}>
              {activeTab === "overview" && (
                <OverviewTab
                  comparison={overviewComparison}
                  rollingThreeYearTri={rollingThreeYearTriComparison}
                  irrStatus={irrStatus}
                  onNavigate={setActiveTab}
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
                  activeFilter={allocationFilter}
                  onActiveFilterChange={setAllocationFilter}
                  rawData={rawAllocationData}
                  view={allocationView}
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
                    <PositionsTableVariant
                      data={tableData}
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                      expanded={expandedPositionRows}
                      onExpandedChange={setExpandedPositionRows}
                      fundHoldings={periodEndFundHoldings}
                      fundStatuses={fundData.statuses}
                      onOpenCompleteHoldings={openCompleteHoldings}
                    />
                  ) : (
                    <FundLookThroughTab
                      positions={currentPositions}
                      holdings={periodEndFundHoldings}
                      statuses={fundData.statuses}
                      query={underlyingQuery}
                      onQueryChange={setUnderlyingQuery}
                      sort={underlyingSort}
                      onSortChange={setUnderlyingSort}
                      expanded={expandedUnderlyingIssuers}
                      onExpandedChange={setExpandedUnderlyingIssuers}
                    />
                  )}
                </div>
              )}
              {activeTab === "quality" && (
                <DataQualityTab
                  positions={latestAccountPositions}
                  accountLabels={accountLabels}
                  errors={scopedPipelineErrors}
                  manualPriceOverrides={scopedManualPriceOverrides}
                  fundStatuses={fundData.statuses}
                  fundReport={fundData.report}
                  fundHoldings={fundData.holdings}
                  fundSnapshots={fundData.snapshots}
                  fundUnresolved={fundData.unresolved}
                  selectedTheme={selectedQualityTheme}
                  onSelectedThemeChange={setSelectedQualityTheme}
                  rawData={rawAllocationData}
                />
              )}
            </Suspense>
          </>
        )}
      </div>
    </div>
    </FilterScopeProvider>
  );
}

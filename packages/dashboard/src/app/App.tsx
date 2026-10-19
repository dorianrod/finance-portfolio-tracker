import { useEffect, useMemo, useState } from "react";
import { useData } from "@/hooks/useData";
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory";
import { useCashHistory } from "@/hooks/useCashHistory";
import { useAllPositions } from "@/hooks/useAllPositions";
import { useErrors } from "@/hooks/useErrors";
import { useManualPriceOverrides } from "@/hooks/useManualPriceOverrides";
import {
  normalizeAccountSelection,
  useFilteredPortfolioHistory,
} from "@/hooks/useFilteredPortfolioHistory";
import { useMonthlyOps } from "@/hooks/useMonthlyOps";
import { useSavingCapacity } from "@/hooks/useSavingCapacity";
import { usePassiveIncome } from "@/hooks/usePassiveIncome";
import { useAccountTypeHistory } from "@/hooks/useAccountTypeHistory";
import { useAnnualIncomeSavings } from "@/hooks/useAnnualIncomeSavings";
import { useRawIsinData } from "@/hooks/useRawIsinData";
import { useFundHoldingsData } from "@/hooks/useFundHoldings";
import { PositionsTable } from "@/features/positions-table/PositionsTable";
import {
  ActiveFilterSummary,
  FilterButton,
  FilterPanel,
} from "@/features/filters/FilterBar";
import {
  AllocationCharts,
  AllocationViewToggle,
  type AllocationView,
} from "@/features/allocation-charts/AllocationCharts";
import { FilterChipBar } from "@/features/allocation-charts/FilterChipBar";
import { computeAllocationCoverageByAccount } from "@/features/allocation-charts/allocationCoverage.logic";
import type { AllocationFilter } from "@/features/allocation-charts/allocationCharts.types";
import { OverviewTab } from "@/features/dashboard/OverviewTab";
import { WealthTab } from "@/features/dashboard/WealthTab";
import { PerformanceTab } from "@/features/dashboard/PerformanceTab";
import { DataQualityTab } from "@/features/dashboard/DataQualityTab";
import type { QualityThemeId } from "@/features/dashboard/DataQualityTab";
import { FundLookThroughTab } from "@/features/fund-holdings/FundLookThroughTab";
import type { FundExposureSort } from "@/features/fund-holdings/FundHoldingsExplorer";
import {
  computeFundExposurePercentages,
  scopeFundQualityData,
} from "@/features/fund-holdings/fundQualityScope.logic";
import {
  HoldingsViewTabs,
  type HoldingsView,
} from "@/features/holdings/HoldingsViewTabs";
import type { Filters, SortKey } from "@/types/filters";
import type { ExpandedState } from "@tanstack/react-table";
import { accountFilterId, rawAccountId } from "@/shared/filters/accountFilter";
import {
  accountLabel,
  clearFilterGroup,
  filterSummaries,
  filterVisibilityForTab,
  resetFilters,
} from "@/features/filters/filterBar.logic";
import { hasMaterialQualityGap } from "@/shared/quality/qualityThresholds";
import { partitionPercentages } from "@/shared/format/percentage";
import {
  AnalysisReliabilityKpi,
  CombinedAnalysisReliabilityKpi,
  PipelineReliabilityKpi,
  aggregateReliabilityTone,
  percentageReliabilityTone,
  pipelineReliabilityTone,
  pipelineStatusLabel,
} from "@/shared/ui/AnalysisReliabilityKpi";
import type { AnalysisReliabilityTone } from "@/shared/ui/AnalysisReliabilityKpi";
import {
  buildCumulativeWealthDrivers,
  computeConcentration,
  computeHeldAssetConcentration,
  computePerformanceSummary,
  computePeriodDrivers,
  computeTrailing12mYearOverYear,
  computeTrailing12mIncome,
  computeTrailing12mSavings,
  filterMonthlyOpsByAccounts,
  filterPointsByPeriod,
} from "@/features/portfolio-charts/portfolioCharts.logic";
import {
  applyPositionFilters,
  applyAccountFilterToHistory,
  buildAccountTypeBreakdown,
  scopePipelineErrors,
  sortPositionsForTable,
} from "./app.logic";

type AnalysisTab =
  | "overview"
  | "wealth"
  | "performance"
  | "allocation"
  | "holdings"
  | "quality";

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

function periodLabel(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return "";
  if (dateFrom && dateTo) return `${dateFrom} to ${dateTo}`;
  if (dateFrom) return `Since ${dateFrom}`;
  return `Until ${dateTo}`;
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

  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
  const [holdingsView, setHoldingsView] = useState<HoldingsView>("positions");
  const [selectedQualityTheme, setSelectedQualityTheme] =
    useState<QualityThemeId | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allocationFilter, setAllocationFilter] =
    useState<AllocationFilter | null>(null);
  const [allocationView, setAllocationView] =
    useState<AllocationView>("current");
  const [underlyingQuery, setUnderlyingQuery] = useState("");
  const [underlyingSort, setUnderlyingSort] =
    useState<FundExposureSort>("value");
  const [expandedUnderlyingIssuers, setExpandedUnderlyingIssuers] =
    useState<Set<string>>(new Set());
  const [expandedPositionRows, setExpandedPositionRows] =
    useState<ExpandedState>({});
  const [sortKey, setSortKey] = useState<SortKey>("total_value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filters>(() => resetFilters());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const enrichedHistory = useMemo(() => {
    const cashByDate = new Map(
      cashHistory.map((cash) => [cash.date, cash.total_broker_cash]),
    );
    return history.map((point) => ({
      ...point,
      total_broker_cash: cashByDate.get(point.date) ?? 0,
    }));
  }, [history, cashHistory]);

  const allAccountTypes = useMemo(
    () =>
      [
        ...new Set(
          positions
            .map((position) => position.account_type)
            .filter((type): type is string => !!type),
        ),
      ].sort(),
    [positions],
  );
  const accountToType = useMemo(() => {
    const map: Record<string, string> = {};
    for (const position of positions)
      if (position.account_type)
        map[accountFilterId(position)] = position.account_type;
    return map;
  }, [positions]);
  const allAccounts = useMemo(
    () => [...new Set(positions.map(accountFilterId))].sort(),
    [positions],
  );
  const accountFilterLabels = useMemo(() => {
    const labels = { ...accountLabels };
    for (const position of positions) {
      const id = accountFilterId(position);
      if (!labels[id])
        labels[id] =
          id === position.account
            ? accountLabel(position.account, accountLabels)
            : position.name;
    }
    return labels;
  }, [positions, accountLabels]);
  const allOperationTypes = useMemo(
    () =>
      [
        ...new Set(
          positions.flatMap((position) => [...position.operationTypes]),
        ),
      ].sort(),
    [positions],
  );

  const currentFilters = useMemo<Filters>(
    () => ({
      ...filters,
      operationTypes: new Set<string>(),
      hideClosedPositions: false,
      dateFrom: undefined,
      dateTo: undefined,
    }),
    [filters],
  );
  const currentPositions = useMemo(
    () => applyPositionFilters(positions, currentFilters),
    [positions, currentFilters],
  );
  const tableFiltered = useMemo(
    () => applyPositionFilters(positions, filters),
    [positions, filters],
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
  const irrStatus = filteredHistory.loading
    ? "loading"
    : filteredHistory.error
      ? "error"
      : "ready";
  const irrScopeLabel =
    filteredHistory.isFiltered && irrStatus === "ready"
      ? "Selected accounts"
      : undefined;
  const demoPresetSelection = useMemo(() => {
    if (!filteredHistory.demoPresetAccounts) return null;
    const included = new Set(filteredHistory.demoPresetAccounts);
    return new Set(
      allAccounts.filter((account) => included.has(rawAccountId(account))),
    );
  }, [allAccounts, filteredHistory.demoPresetAccounts]);
  const demoPresetActive = useMemo(() => {
    if (!filteredHistory.demoPresetAccounts) return false;
    const selected = normalizeAccountSelection(filters.accounts);
    return (
      selected.length === filteredHistory.demoPresetAccounts.length &&
      selected.every(
        (account, index) =>
          account === filteredHistory.demoPresetAccounts?.[index],
      )
    );
  }, [filteredHistory.demoPresetAccounts, filters.accounts]);

  const savingCapacity = useSavingCapacity(filters.accounts);
  const periodSavings = useMemo(
    () =>
      filterPointsByPeriod(savingCapacity, filters.dateFrom, filters.dateTo),
    [savingCapacity, filters.dateFrom, filters.dateTo],
  );
  const trailingSavings = useMemo(
    () => computeTrailing12mSavings(periodSavings),
    [periodSavings],
  );
  const trailingYearComparison = useMemo(
    () => computeTrailing12mYearOverYear(savingCapacity),
    [savingCapacity],
  );
  const wealthDrivers = useMemo(
    () => buildCumulativeWealthDrivers(periodSavings),
    [periodSavings],
  );
  const drivers = useMemo(
    () => computePeriodDrivers(periodSavings),
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
  const performance = useMemo(
    () => computePerformanceSummary(currentPositions),
    [currentPositions],
  );
  const trailingIncome = useMemo(
    () =>
      computeTrailing12mIncome(currentPositions, displayedHistory.at(-1)?.date),
    [currentPositions, displayedHistory],
  );
  const lookThroughConcentration = useMemo(
    () => computeConcentration(tableFiltered, fundHoldings),
    [tableFiltered, fundHoldings],
  );
  const heldAssetConcentration = useMemo(
    () => computeHeldAssetConcentration(tableFiltered),
    [tableFiltered],
  );
  const coverage = useMemo(
    () =>
      rawAllocationData.loading
        ? []
        : computeAllocationCoverageByAccount(
            currentPositions,
            rawAllocationData,
          ),
    [currentPositions, rawAllocationData],
  );
  const unallocatedPct = useMemo(() => {
    if (rawAllocationData.loading) return null;
    const allocated = coverage.reduce((sum, item) => sum + item.allocated, 0);
    const unallocated = coverage.reduce(
      (sum, item) => sum + item.unallocated,
      0,
    );
    const notApplicable = coverage.reduce(
      (sum, item) => sum + item.notApplicable,
      0,
    );
    return partitionPercentages([allocated, unallocated, notApplicable])[1];
  }, [coverage, rawAllocationData.loading]);

  const classificationMappedValue = coverage.reduce(
    (sum, item) => sum + item.allocated,
    0,
  );
  const classificationUnmappedValue = coverage.reduce(
    (sum, item) => sum + item.unallocated,
    0,
  );
  const classificationApplicableValue =
    classificationMappedValue + classificationUnmappedValue;
  const classificationReliabilityPct = classificationApplicableValue > 0
    ? (classificationMappedValue / classificationApplicableValue) * 100
    : null;

  const scopedFundQuality = useMemo(
    () =>
      scopeFundQualityData(
        currentPositions,
        fundData.holdings,
        fundData.statuses,
        fundData.snapshots,
        fundData.unresolved,
        fundData.report,
      ),
    [
      currentPositions,
      fundData.holdings,
      fundData.statuses,
      fundData.snapshots,
      fundData.unresolved,
      fundData.report,
    ],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey)
      setSortDir((direction) => (direction === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const hasFundValidationError = scopedFundQuality.statuses.some(
    (status) => status.validationStatus === "error",
  );
  const unresolvedFundValue = scopedFundQuality.report
    ? scopedFundQuality.report.undisclosedFundValue +
      scopedFundQuality.report.opaqueValue
    : 0;
  const identifiedFundValue = scopedFundQuality.report
    ? scopedFundQuality.report.directIdentifiedValue +
      scopedFundQuality.report.decomposedValue
    : 0;
  const fundExposurePercentages = computeFundExposurePercentages(
    identifiedFundValue,
    unresolvedFundValue,
    scopedFundQuality.notApplicableValue,
  );
  const underlyingReliabilityPct = scopedFundQuality.report
    ? fundExposurePercentages.identified
    : null;
  const underlyingCritical = hasFundValidationError || scopedFundQuality.report?.feasibilityStatus === "limited";
  const classificationMetricTone = percentageReliabilityTone(
    rawAllocationData.loading ? null : classificationReliabilityPct,
  );
  const underlyingMetricTone: AnalysisReliabilityTone = underlyingCritical
    ? "critical"
    : scopedFundQuality.report?.feasibilityStatus === "pending_repeatability"
      ? "warning"
      : percentageReliabilityTone(scopedFundQuality.report ? underlyingReliabilityPct : null);
  const diversificationReliabilityTone = aggregateReliabilityTone([
    classificationMetricTone,
    underlyingMetricTone,
  ]);
  const reliabilityPriority: Record<AnalysisReliabilityTone, number> = {
    healthy: 0,
    warning: 1,
    unavailable: 2,
    critical: 3,
  };
  const diversificationQualityTheme: QualityThemeId =
    reliabilityPriority[underlyingMetricTone] > reliabilityPriority[classificationMetricTone]
      ? "lookthrough"
      : "classification";
  const pipelineQualityPositions = activeTab === "holdings" && holdingsView === "positions"
    ? tableFiltered
    : currentPositions;
  const scopedPipelineErrors = useMemo(
    () => scopePipelineErrors(pipelineErrors, pipelineQualityPositions, filters),
    [pipelineErrors, pipelineQualityPositions, filters],
  );
  const scopedPipelineErrorCount = scopedPipelineErrors.filter(
    (item) => item.level === "error",
  ).length;
  const scopedPipelineWarningCount = scopedPipelineErrors.length - scopedPipelineErrorCount;
  const portfolioDataTone = pipelineReliabilityTone({
    errorCount: scopedPipelineErrorCount,
    warningCount: scopedPipelineWarningCount,
    loading: pipelineErrorsLoading,
  });
  const portfolioDataStatus = pipelineStatusLabel({
    errorCount: scopedPipelineErrorCount,
    warningCount: scopedPipelineWarningCount,
    loading: pipelineErrorsLoading,
  });
  const overviewReliabilityTone = aggregateReliabilityTone([
    portfolioDataTone,
    classificationMetricTone,
    underlyingMetricTone,
  ]);
  const overviewQualityTheme = [
    { theme: "pipeline" as const, tone: portfolioDataTone },
    { theme: "classification" as const, tone: classificationMetricTone },
    { theme: "lookthrough" as const, tone: underlyingMetricTone },
  ].reduce((mostRelevant, candidate) => (
    reliabilityPriority[candidate.tone] > reliabilityPriority[mostRelevant.tone]
      ? candidate
      : mostRelevant
  )).theme;
  const unresolvedFundPct = fundExposurePercentages.unresolved;
  const qualityCount =
    Number(pipelineErrors.length > 0) +
    Number(manualPriceOverrides.length > 0) +
    Number(hasMaterialQualityGap(unallocatedPct ?? 0)) +
    Number(hasFundValidationError || hasMaterialQualityGap(unresolvedFundPct));
  const copy = activeTab === "holdings" ? HOLDINGS_COPY[holdingsView] : TAB_COPY[activeTab];
  const filterVisibility = filterVisibilityForTab(activeTab, holdingsView);
  const activeFilterSummaries = filterSummaries(
    filters,
    accountFilterLabels,
    filterVisibility,
  );

  function handleResetFilters() {
    setFilters(resetFilters());
    setAllocationFilter(null);
  }

  function openDataQuality(theme: QualityThemeId) {
    setSelectedQualityTheme(theme);
    setActiveTab("quality");
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 text-gray-100 sm:p-6">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-5 flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          </div>
          <button
            onClick={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
            className="ml-auto rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </header>

        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && (
          <>
            <nav
              className="mb-5 flex overflow-x-auto border-b border-gray-800"
              aria-label="Portfolio analyses"
            >
              {PRIMARY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedQualityTheme(null);
                  setActiveTab("quality");
                }}
                className={`ml-auto flex shrink-0 items-center gap-2 border-b-2 border-l px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === "quality" ? "border-b-blue-500 border-l-gray-800 text-white" : "border-b-transparent border-l-gray-800 text-gray-500 hover:text-gray-300"}`}
              >
                Data quality
                {qualityCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${pipelineErrors.some((item) => item.level === "error") || hasFundValidationError ? "bg-red-900/60 text-red-300" : "bg-amber-900/60 text-amber-300"}`}
                  >
                    {qualityCount}
                  </span>
                )}
              </button>
            </nav>

            {activeTab === "holdings" && (
              <HoldingsViewTabs value={holdingsView} onChange={setHoldingsView} />
            )}

            <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-800 pb-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  {copy.title}
                </h2>
                {activeTab !== "overview" && activeTab !== "allocation" && activeTab !== "quality" && !(activeTab === "holdings" && holdingsView === "underlying") && (
                  <div className="mt-2">
                    <PipelineReliabilityKpi
                      errorCount={scopedPipelineErrorCount}
                      warningCount={scopedPipelineWarningCount}
                      loading={pipelineErrorsLoading}
                      onClick={() => openDataQuality("pipeline")}
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
                    />
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">{copy.description}</p>
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
              items={activeFilterSummaries}
              onRemove={(item) =>
                setFilters((current) => clearFilterGroup(current, item.key))
              }
              onReset={handleResetFilters}
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
              onReset={handleResetFilters}
              demoPresetSelection={demoPresetSelection}
              demoPresetActive={demoPresetActive}
            />

            {activeTab === "overview" && (
              <OverviewTab
                history={displayedHistory}
                performance={performance}
                drivers={drivers}
                income={trailingIncome}
                heldAssetConcentration={heldAssetConcentration}
                lookThroughConcentration={lookThroughConcentration}
                globalTri={globalTri}
                irrStatus={irrStatus}
                irrScopeLabel={irrScopeLabel}
                periodLabel={periodLabel(filters.dateFrom, filters.dateTo)}
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
                annualIncomeSavings={annualIncomeSavings}
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
                fundHoldings={fundHoldings}
                accountFilters={filters.accounts}
                activeFilter={allocationFilter}
                onActiveFilterChange={setAllocationFilter}
                view={allocationView}
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
                    groupByType={allAccountTypes.length > 0}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    expanded={expandedPositionRows}
                    onExpandedChange={setExpandedPositionRows}
                    fundHoldings={fundHoldings}
                    fundStatuses={fundData.statuses}
                    onOpenCompleteHoldings={(fundName) => {
                      setUnderlyingQuery(fundName);
                      setHoldingsView("underlying");
                    }}
                  />
                ) : (
                  <FundLookThroughTab
                    positions={currentPositions}
                    holdings={fundHoldings}
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
                positions={currentPositions}
                accountLabels={accountLabels}
                errors={pipelineErrors}
                manualPriceOverrides={manualPriceOverrides}
                fundStatuses={fundData.statuses}
                fundReport={fundData.report}
                fundHoldings={fundData.holdings}
                fundSnapshots={fundData.snapshots}
                fundUnresolved={fundData.unresolved}
                selectedTheme={selectedQualityTheme}
                onSelectedThemeChange={setSelectedQualityTheme}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

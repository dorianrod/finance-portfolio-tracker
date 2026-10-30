import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useBuildDashboardLoadState } from '@/app/helpers/presenters/useBuildDashboardLoadState'
import { useBuildDashboardSourceData } from '@/app/helpers/transformers/useBuildDashboardSourceData'
import { useCachedDashboardSources } from '@/app/services/useCachedDashboardSources'
import { useDashboardQuality } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/useDashboardQuality'
import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { useSortedPositions } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/useSortedPositions'
import { dashboardPositionSortDirectionAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortDirection.atoms'
import { dashboardPositionSortKeyAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable/dashboardPositionSortKey.atoms'
import { useOverviewComparison } from '@/domains/portfolio/features/overview/helpers/transformers/useOverviewComparison'
import { useDashboardPerformance } from '@/domains/portfolio/features/performance/services/useDashboardPerformance'
import { useDashboardWealth } from '@/domains/portfolio/features/wealth/services/useDashboardWealth'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import { useGetSavingCapacityQuery } from '@/domains/portfolio/shared/apis/queries/useGetSavingCapacityQuery'
import { usePortfolioPositions } from '@/domains/portfolio/shared/helpers/transformers/usePortfolioPositions'
import { useDashboardHistory } from '@/domains/portfolio/shared/services/useDashboardHistory'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

// eslint-disable-next-line complexity, max-lines-per-function -- reviewed: 2026-10-27; This shell facade composes feature-owned models and query fallbacks; its length is the memoized output contract and dependency list.
export function useDashboardViewModel() {
  const [
    dashboardQuery,
    historyQuery,
    cashHistoryQuery,
    allPositionsQuery,
    pipelineErrorsQuery,
    manualPriceOverridesQuery,
    monthlyOpsQuery,
    rawAllocationQuery,
    fundHoldingsQuery,
    fundDiagnosticsQuery,
    annualIncomeSavingsQuery,
  ] = useCachedDashboardSources()
  const buildDashboardSourceData = useBuildDashboardSourceData()
  const buildDashboardLoadState = useBuildDashboardLoadState()
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const { data: fundHoldings = EMPTY_FUND_HOLDINGS } = fundHoldingsQuery
  const { data: fundDiagnostics = EMPTY_FUND_DIAGNOSTICS } =
    fundDiagnosticsQuery
  const fundData = useMemo(
    () => ({
      ...fundHoldings,
      ...fundDiagnostics,
    }),
    [fundHoldings, fundDiagnostics],
  )
  const savingCapacityQuery = useGetSavingCapacityQuery(filters.accounts)
  const { data: savingCapacity = EMPTY_SAVING_CAPACITY } = savingCapacityQuery
  const savingCapacityLoading = savingCapacityQuery.isPending
  const savingCapacityError = savingCapacityQuery.error
  const { data: dashboardData = EMPTY_DASHBOARD_DATA } = dashboardQuery
  const { positions, rawPositions, rawOperations, accountLabels } =
    dashboardData
  const { data: history = EMPTY_PORTFOLIO_HISTORY } = historyQuery
  const { data: cashHistory = EMPTY_CASH_HISTORY } = cashHistoryQuery
  const { data: allPositionRows = EMPTY_RAW_POSITIONS } = allPositionsQuery
  const { data: pipelineErrors = EMPTY_ERRORS } = pipelineErrorsQuery
  const pipelineErrorsLoading = pipelineErrorsQuery.isPending
  const { data: manualPriceOverrides = EMPTY_MANUAL_PRICE_OVERRIDES } =
    manualPriceOverridesQuery
  const { data: allMonthlyOps = EMPTY_MONTHLY_OPS } = monthlyOpsQuery
  const { data: allocationRows = EMPTY_RAW_ISIN_DATA } = rawAllocationQuery
  const rawAllocationData = useMemo(
    () => ({
      ...allocationRows,
      loading: rawAllocationQuery.isPending,
    }),
    [allocationRows, rawAllocationQuery.isPending],
  )
  const { data: annualIncomeSavings = EMPTY_ANNUAL_INCOME_SAVINGS } =
    annualIncomeSavingsQuery

  const {
    accountFilterLabels,
    accountToType,
    allAccounts,
    allAccountTypes,
    allOperationTypes,
    enrichedHistory,
  } = useMemo(
    () =>
      buildDashboardSourceData({
        accountLabels,
        cashHistory,
        history,
        positions,
      }),
    [accountLabels, buildDashboardSourceData, cashHistory, history, positions],
  )

  const {
    currentPositions,
    latestAccountPositions,
    periodEndFundHoldings,
    periodPositions,
    tableFiltered,
  } = usePortfolioPositions({
    filters,
    fundData,
    positions,
    rawOperations,
    rawPositions,
  })

  const tableData = useSortedPositions(
    tableFiltered,
    filters.hideClosedPositions,
    allAccountTypes,
    sortKey,
    sortDir,
  )

  const {
    accountHistory,
    demoPresetActive,
    demoPresetSelection,
    displayedHistory,
    globalTri,
    irrStatus,
  } = useDashboardHistory({
    allAccounts,
    allPositionRows,
    enrichedHistory,
    filters,
  })

  const {
    accountTypeData,
    displayedAnnualIncomeSavings,
    displayedTypeHistory,
    monthlyOps,
    trailingSavings,
    trailingYearComparison,
    typeHistory,
    wealthDrivers,
  } = useDashboardWealth({
    savingCapacity,
    allMonthlyOps,
    annualIncomeSavings,
    currentPositions,
    filters,
  })
  const { overviewComparison, rollingThreeYearTriComparison } =
    useOverviewComparison({
      accountHistory,
      filters,
      fundHoldingsHistory: fundData.history,
      rawOperations,
      rawPositions,
      savingCapacity,
    })

  const {
    passiveIncome,
    performance,
    trailingIncome,
    passiveIncomeLoading,
    passiveIncomeError,
    passiveIncomeUpdating,
  } = useDashboardPerformance({
    currentPositions,
    displayedHistory,
    filters,
    periodPositions,
  })
  const {
    qualitySummary,
    scopedFundQuality,
    scopedManualPriceOverrides,
    scopedPipelineErrors,
  } = useDashboardQuality({
    activeTab,
    filters,
    fundData,
    holdingsView,
    latestAccountPositions,
    manualPriceOverrides,
    pipelineErrors,
    pipelineErrorsLoading,
    rawAllocationData,
    tableFiltered,
  })

  const loadState = useMemo(
    () =>
      buildDashboardLoadState([
        { error: dashboardQuery.error, isPending: dashboardQuery.isPending },
        { error: historyQuery.error, isPending: historyQuery.isPending },
        {
          error: cashHistoryQuery.error,
          isPending: cashHistoryQuery.isPending,
        },
        {
          error: allPositionsQuery.error,
          isPending: allPositionsQuery.isPending,
        },
        {
          error: pipelineErrorsQuery.error,
          isPending: pipelineErrorsQuery.isPending,
        },
        {
          error: manualPriceOverridesQuery.error,
          isPending: manualPriceOverridesQuery.isPending,
        },
        { error: monthlyOpsQuery.error, isPending: monthlyOpsQuery.isPending },
        {
          error: rawAllocationQuery.error,
          isPending: rawAllocationQuery.isPending,
        },
        {
          error: fundHoldingsQuery.error,
          isPending: fundHoldingsQuery.isPending,
        },
        {
          error: fundDiagnosticsQuery.error,
          isPending: fundDiagnosticsQuery.isPending,
        },
        {
          error: annualIncomeSavingsQuery.error,
          isPending: annualIncomeSavingsQuery.isPending,
        },
        { isPending: savingCapacityLoading, error: savingCapacityError },
        { isPending: passiveIncomeLoading, error: passiveIncomeError },
      ]),
    [
      buildDashboardLoadState,
      dashboardQuery.error,
      dashboardQuery.isPending,
      historyQuery.error,
      historyQuery.isPending,
      cashHistoryQuery.error,
      cashHistoryQuery.isPending,
      allPositionsQuery.error,
      allPositionsQuery.isPending,
      pipelineErrorsQuery.error,
      pipelineErrorsQuery.isPending,
      manualPriceOverridesQuery.error,
      manualPriceOverridesQuery.isPending,
      monthlyOpsQuery.error,
      monthlyOpsQuery.isPending,
      rawAllocationQuery.error,
      rawAllocationQuery.isPending,
      fundHoldingsQuery.error,
      fundHoldingsQuery.isPending,
      fundDiagnosticsQuery.error,
      fundDiagnosticsQuery.isPending,
      annualIncomeSavingsQuery.error,
      annualIncomeSavingsQuery.isPending,
      savingCapacityLoading,
      savingCapacityError,
      passiveIncomeLoading,
      passiveIncomeError,
    ],
  )
  const error = loadState.status === 'error' ? loadState.message : null
  const loading = loadState.status === 'loading'
  const updating =
    savingCapacityQuery.isPlaceholderData || passiveIncomeUpdating

  return useMemo(
    () => ({
      loadState,
      accountFilterLabels,
      accountLabels,
      accountToType,
      accountTypeData,
      allAccounts,
      allAccountTypes,
      allOperationTypes,
      demoPresetActive,
      demoPresetSelection,
      displayedAnnualIncomeSavings,
      displayedHistory,
      displayedTypeHistory,
      error,
      fundData,
      globalTri,
      irrStatus,
      latestAccountPositions,
      loading,
      updating,
      monthlyOps,
      overviewComparison,
      passiveIncome,
      performance,
      periodEndFundHoldings,
      qualitySummary,
      rawAllocationData,
      rawOperations,
      rawPositions,
      rollingThreeYearTriComparison,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
      pipelineErrorsLoading,
      tableData,
      trailingIncome,
      trailingSavings,
      trailingYearComparison,
      typeHistory,
      useGroupedPositionsTable: allAccountTypes.length > 0,
      wealthDrivers,
      currentPositions,
    }),
    [
      loadState,
      accountFilterLabels,
      accountLabels,
      accountToType,
      accountTypeData,
      allAccounts,
      allAccountTypes,
      allOperationTypes,
      currentPositions,
      demoPresetActive,
      demoPresetSelection,
      displayedAnnualIncomeSavings,
      displayedHistory,
      displayedTypeHistory,
      error,
      fundData,
      globalTri,
      irrStatus,
      latestAccountPositions,
      loading,
      updating,
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
      wealthDrivers,
    ],
  )
}

const EMPTY_DASHBOARD_DATA: DashboardData = {
  positions: [],
  rawPositions: [],
  rawOperations: [],
  accountLabels: {},
}

const EMPTY_RAW_ISIN_DATA: RawIsinRows = {
  geo: [],
  secteur: [],
  currency: [],
  classe: [],
}

const EMPTY_ANNUAL_INCOME_SAVINGS: AnnualIncomeSavingsPoint[] = []
const EMPTY_CASH_HISTORY: CashHistoryPoint[] = []
const EMPTY_SAVING_CAPACITY: SavingCapacityPoint[] = []
const EMPTY_ERRORS: PipelineError[] = []
const EMPTY_FUND_HOLDINGS: FundHoldingsData = {
  holdings: [],
  history: [],
  statuses: [],
}
const EMPTY_FUND_DIAGNOSTICS: FundDiagnostics = {
  report: null,
  snapshots: [],
  unresolved: [],
}
const EMPTY_MANUAL_PRICE_OVERRIDES: ManualPriceOverride[] = []
const EMPTY_MONTHLY_OPS: MonthlyOperationsByMonth = new Map()
const EMPTY_PORTFOLIO_HISTORY: PortfolioHistoryPoint[] = []
const EMPTY_RAW_POSITIONS: RawPositionRow[] = []

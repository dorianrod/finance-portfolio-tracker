import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { resolveDashboardLoadState } from '@/app/helpers/mappers/resolveDashboardLoadState'
import { useDashboardQuality } from '@/domains/portfolio/features/data-quality/features/assessment/services/useDashboardQuality'
import { useSortedPositions } from '@/domains/portfolio/features/holdings/features/positions/services/useSortedPositions'
import {
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/features/holdings/features/positions/stores/dashboardPositionsTable.atoms'
import { useOverviewComparison } from '@/domains/portfolio/features/overview/services/useOverviewComparison'
import { useDashboardPerformance } from '@/domains/portfolio/features/performance/services/useDashboardPerformance'
import { useDashboardWealth } from '@/domains/portfolio/features/wealth/services/useDashboardWealth'
import { useAllocationRowsQuery } from '@/domains/portfolio/shared/apis/queries/useAllocationRowsQuery'
import { useAnnualIncomeSavingsQuery } from '@/domains/portfolio/shared/apis/queries/useAnnualIncomeSavingsQuery'
import { useBrokerageCashHistoryQuery } from '@/domains/portfolio/shared/apis/queries/useBrokerageCashHistoryQuery'
import { useDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useDashboardDataQuery'
import { useFundHoldingsQuery } from '@/domains/portfolio/shared/apis/queries/useFundHoldingsQuery'
import { useManualPriceOverridesQuery } from '@/domains/portfolio/shared/apis/queries/useManualPriceOverridesQuery'
import { useMonthlyOperationsQuery } from '@/domains/portfolio/shared/apis/queries/useMonthlyOperationsQuery'
import { usePipelineErrorsQuery } from '@/domains/portfolio/shared/apis/queries/usePipelineErrorsQuery'
import { usePortfolioHistoryQuery } from '@/domains/portfolio/shared/apis/queries/usePortfolioHistoryQuery'
import { usePositionsQuery } from '@/domains/portfolio/shared/apis/queries/usePositionsQuery'
import { useSavingCapacityQuery } from '@/domains/portfolio/shared/apis/queries/useSavingCapacityQuery'
import { buildDashboardSourceData } from '@/domains/portfolio/shared/helpers/mappers/buildDashboardSourceData'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import { useDashboardHistory } from '@/domains/portfolio/shared/services/useDashboardHistory'
import { usePortfolioPositions } from '@/domains/portfolio/shared/services/usePortfolioPositions'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useDashboardViewModel() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const dashboardQuery = useDashboardDataQuery()
  const historyQuery = usePortfolioHistoryQuery()
  const cashHistoryQuery = useBrokerageCashHistoryQuery()
  const allPositionsQuery = usePositionsQuery()
  const pipelineErrorsQuery = usePipelineErrorsQuery()
  const manualPriceOverridesQuery = useManualPriceOverridesQuery()
  const monthlyOpsQuery = useMonthlyOperationsQuery()
  const rawAllocationQuery = useAllocationRowsQuery()
  const fundHoldingsQuery = useFundHoldingsQuery()
  const fundData = fundHoldingsQuery.data ?? EMPTY_FUND_HOLDINGS
  const savingCapacityQuery = useSavingCapacityQuery(filters.accounts)
  const savingCapacity = savingCapacityQuery.data ?? EMPTY_SAVING_CAPACITY
  const savingCapacityLoading = savingCapacityQuery.isPending
  const savingCapacityError = savingCapacityQuery.error
  const annualIncomeSavingsQuery = useAnnualIncomeSavingsQuery()
  const { positions, rawPositions, rawOperations, accountLabels } =
    dashboardQuery.data ?? EMPTY_DASHBOARD_DATA
  const history = historyQuery.data ?? EMPTY_PORTFOLIO_HISTORY
  const cashHistory = cashHistoryQuery.data ?? EMPTY_CASH_HISTORY
  const allPositionRows = allPositionsQuery.data ?? EMPTY_RAW_POSITIONS
  const pipelineErrors = pipelineErrorsQuery.data ?? EMPTY_ERRORS
  const pipelineErrorsLoading = pipelineErrorsQuery.isPending
  const manualPriceOverrides =
    manualPriceOverridesQuery.data ?? EMPTY_MANUAL_PRICE_OVERRIDES
  const allMonthlyOps = monthlyOpsQuery.data ?? EMPTY_MONTHLY_OPS
  const rawAllocationData = useMemo(
    () => ({
      ...(rawAllocationQuery.data ?? EMPTY_RAW_ISIN_DATA),
      loading: rawAllocationQuery.isPending,
    }),
    [rawAllocationQuery.data, rawAllocationQuery.isPending],
  )
  const annualIncomeSavings =
    annualIncomeSavingsQuery.data ?? EMPTY_ANNUAL_INCOME_SAVINGS

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
    [accountLabels, cashHistory, history, positions],
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
    irrScopeLabel,
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
      resolveDashboardLoadState([
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
          error: annualIncomeSavingsQuery.error,
          isPending: annualIncomeSavingsQuery.isPending,
        },
        { isPending: savingCapacityLoading, error: savingCapacityError },
        { isPending: passiveIncomeLoading, error: passiveIncomeError },
      ]),
    [
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
      irrScopeLabel,
      irrStatus,
      latestAccountPositions,
      loading,
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
  report: null,
  snapshots: [],
  unresolved: [],
}
const EMPTY_MANUAL_PRICE_OVERRIDES: ManualPriceOverride[] = []
const EMPTY_MONTHLY_OPS: MonthlyOperationsByMonth = new Map()
const EMPTY_PORTFOLIO_HISTORY: PortfolioHistoryPoint[] = []
const EMPTY_RAW_POSITIONS: RawPositionRow[] = []

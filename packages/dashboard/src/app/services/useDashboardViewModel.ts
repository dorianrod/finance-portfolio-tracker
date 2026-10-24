import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { useAllPositions } from '@/domains/portfolio/shared/apis/queries/useAllPositions'
import { useAnnualIncomeSavings } from '@/domains/portfolio/shared/apis/queries/useAnnualIncomeSavings'
import { useCashHistory } from '@/domains/portfolio/shared/apis/queries/useCashHistory'
import type { CashHistoryPoint } from '@/domains/portfolio/shared/types/cashHistoryPoint.type'
import { useData } from '@/domains/portfolio/shared/apis/queries/useData'
import { useErrors } from '@/domains/portfolio/shared/apis/queries/useErrors'
import { useFundHoldingsData } from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHolding.type'
import { useManualPriceOverrides } from '@/domains/portfolio/shared/apis/queries/useManualPriceOverrides'
import { useMonthlyOps } from '@/domains/portfolio/shared/apis/queries/useMonthlyOps'
import { usePortfolioHistory } from '@/domains/portfolio/shared/apis/queries/usePortfolioHistory'
import { useRawIsinData } from '@/domains/portfolio/shared/apis/queries/useRawIsinData'
import type { RawIsinRows } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import { buildDashboardSourceData } from '@/app/helpers/mappers/buildDashboardSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import {
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/shared/stores/dashboardPositionsTable.atoms'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import { useDashboardHistory } from '@/app/services/useDashboardHistory'
import { useDashboardPositions } from '@/app/services/useDashboardPositions'
import { useDashboardPerformance } from '@/app/services/useDashboardPerformance'
import { useDashboardWealth } from '@/app/services/useDashboardWealth'
import { useDashboardQuality } from '@/app/services/useDashboardQuality'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/shared/types/monthlyOperation.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import type { RawPositionRow } from '@/domains/portfolio/shared/types/rawPosition.type'

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

export function useDashboardViewModel() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const sortDir = useAtomValue(dashboardPositionSortDirectionAtom)
  const sortKey = useAtomValue(dashboardPositionSortKeyAtom)
  const dashboardQuery = useData()
  const historyQuery = usePortfolioHistory()
  const cashHistoryQuery = useCashHistory()
  const allPositionsQuery = useAllPositions()
  const pipelineErrorsQuery = useErrors()
  const manualPriceOverridesQuery = useManualPriceOverrides()
  const monthlyOpsQuery = useMonthlyOps()
  const rawAllocationQuery = useRawIsinData()
  const fundHoldingsQuery = useFundHoldingsData()
  const fundData = fundHoldingsQuery.data ?? EMPTY_FUND_HOLDINGS
  const annualIncomeSavingsQuery = useAnnualIncomeSavings()
  const {
    positions,
    rawPositions,
    rawOperations,
    accountLabels,
  } = dashboardQuery.data ?? EMPTY_DASHBOARD_DATA
  const history = historyQuery.data ?? EMPTY_PORTFOLIO_HISTORY
  const cashHistory = cashHistoryQuery.data ?? EMPTY_CASH_HISTORY
  const allPositionRows = allPositionsQuery.data ?? EMPTY_RAW_POSITIONS
  const pipelineErrors = pipelineErrorsQuery.data ?? EMPTY_ERRORS
  const pipelineErrorsLoading = pipelineErrorsQuery.isPending
  const manualPriceOverrides = manualPriceOverridesQuery.data ?? EMPTY_MANUAL_PRICE_OVERRIDES
  const allMonthlyOps = monthlyOpsQuery.data ?? EMPTY_MONTHLY_OPS
  const rawAllocationData = useMemo(() => ({
    ...(rawAllocationQuery.data ?? EMPTY_RAW_ISIN_DATA),
    loading: rawAllocationQuery.isPending,
  }), [rawAllocationQuery.data, rawAllocationQuery.isPending])
  const annualIncomeSavings = annualIncomeSavingsQuery.data ?? EMPTY_ANNUAL_INCOME_SAVINGS
  const loading = dashboardQuery.isPending
  const error = dashboardQuery.error ? String(dashboardQuery.error) : null

  const {
    accountFilterLabels,
    accountToType,
    allAccounts,
    allAccountTypes,
    allOperationTypes,
    enrichedHistory,
  } = useMemo(
    () => buildDashboardSourceData({ accountLabels, cashHistory, history, positions }),
    [accountLabels, cashHistory, history, positions],
  )

  const {
    currentPositions,
    latestAccountPositions,
    periodEndFundHoldings,
    periodPositions,
    tableData,
    tableFiltered,
  } = useDashboardPositions({
    allAccountTypes,
    filters,
    fundData,
    positions,
    rawOperations,
    rawPositions,
    sortDirection: sortDir,
    sortKey,
  })

  const {
    accountHistory,
    demoPresetActive,
    demoPresetSelection,
    displayedHistory,
    globalTri,
    irrScopeLabel,
    irrStatus,
  } = useDashboardHistory({ allAccounts, allPositionRows, enrichedHistory, filters })

  const {
    accountTypeData,
    displayedAnnualIncomeSavings,
    displayedTypeHistory,
    monthlyOps,
    overviewComparison,
    rollingThreeYearTriComparison,
    trailingSavings,
    trailingYearComparison,
    typeHistory,
    wealthDrivers,
  } = useDashboardWealth({
    accountHistory,
    allMonthlyOps,
    annualIncomeSavings,
    currentPositions,
    filters,
    fundHoldingsHistory: fundData.history,
    rawOperations,
    rawPositions,
  })
  const { passiveIncome, performance, trailingIncome } = useDashboardPerformance({
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

  return useMemo(() => ({
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
  }), [
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
  ])
}

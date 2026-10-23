import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { useAccountTypeHistory } from '@/domains/portfolio/apis/queries/useAccountTypeHistory'
import { useAllPositions, type RawPositionRow } from '@/domains/portfolio/apis/queries/useAllPositions'
import { useAnnualIncomeSavings } from '@/domains/portfolio/apis/queries/useAnnualIncomeSavings'
import { useCashHistory, type CashHistoryPoint } from '@/domains/portfolio/apis/queries/useCashHistory'
import { useData, type DashboardData } from '@/domains/portfolio/apis/queries/useData'
import { useErrors, type ErrorRow } from '@/domains/portfolio/apis/queries/useErrors'
import { useFilteredPortfolioHistory } from '@/domains/portfolio/apis/queries/useFilteredPortfolioHistory'
import { useFundHoldingsData, type FundHoldingsData } from '@/domains/portfolio/apis/queries/useFundHoldings'
import { useManualPriceOverrides, type ManualPriceOverride } from '@/domains/portfolio/apis/queries/useManualPriceOverrides'
import { useMonthlyOps, type MonthlyOpsMap } from '@/domains/portfolio/apis/queries/useMonthlyOps'
import { usePassiveIncome, type PassiveIncomePoint } from '@/domains/portfolio/apis/queries/usePassiveIncome'
import { usePortfolioHistory } from '@/domains/portfolio/apis/queries/usePortfolioHistory'
import { useRawIsinData, type RawIsinRows } from '@/domains/portfolio/apis/queries/useRawIsinData'
import { useSavingCapacity, type SavingCapacityPoint } from '@/domains/portfolio/apis/queries/useSavingCapacity'
import { computeAllocationCoverageByAccount } from '@/domains/portfolio/components/allocation-charts/helpers/quality/computeAllocationCoverage'
import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/components/allocation-charts/helpers/calculators/buildConcentrationTrend'
import { scopeFundQualityData } from '@/domains/portfolio/components/fund-holdings/helpers/quality/scopeFundQualityData'
import {
  buildCumulativeWealthDrivers,
  computePerformanceSummary,
  computeTrailing12mIncome,
  computeTrailing12mSavings,
  computeTrailing12mYearOverYear,
  filterMonthlyOpsByAccounts,
  filterPointsByPeriod,
} from '@/domains/portfolio/components/portfolio-charts/helpers/calculators/calculatePortfolioCharts'
import { filterAnnualIncomeSavingsByPeriod, type AnnualIncomeSavingsPoint } from '@/domains/portfolio/helpers/mappers/mapAnnualIncomeSavings'
import {
  applyAccountFilterToHistory,
  applyPositionFilters,
  buildAccountTypeBreakdown,
  scopeManualPriceOverrides,
  scopePipelineErrors,
  sortPositionsForTable,
} from '@/domains/portfolio/helpers/filters/portfolioDataFilters'
import {
  buildDemoPresetSelection,
  isDemoPresetActive,
  withoutOperationAndPeriodFilters,
  withoutOperationFilters,
} from '@/domains/portfolio/helpers/filters/portfolioFilterScopes'
import { buildPositionRows } from '@/domains/portfolio/helpers/mappers/buildPositionHierarchy'
import { buildOverviewComparison, compareRollingThreeYearIrr } from '@/domains/portfolio/pages/helpers/calculators/buildOverviewComparison'
import { buildDashboardQualitySummary } from '@/domains/portfolio/pages/dashboard/helpers/mappers/buildDashboardQualitySummary'
import { buildDashboardSourceData } from '@/domains/portfolio/pages/dashboard/helpers/mappers/buildDashboardSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardFilters.atoms'
import {
  dashboardActiveTabAtom,
  dashboardHoldingsViewAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardNavigation.atoms'
import {
  dashboardPositionSortDirectionAtom,
  dashboardPositionSortKeyAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardPositionsTable.atoms'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/types/history'

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
const EMPTY_ERRORS: ErrorRow[] = []
const EMPTY_FUND_HOLDINGS: FundHoldingsData = {
  holdings: [],
  history: [],
  statuses: [],
  report: null,
  snapshots: [],
  unresolved: [],
}
const EMPTY_MANUAL_PRICE_OVERRIDES: ManualPriceOverride[] = []
const EMPTY_MONTHLY_OPS: MonthlyOpsMap = new Map()
const EMPTY_PASSIVE_INCOME: PassiveIncomePoint[] = []
const EMPTY_PORTFOLIO_HISTORY: PortfolioHistoryPoint[] = []
const EMPTY_RAW_POSITIONS: RawPositionRow[] = []
const EMPTY_SAVING_CAPACITY: SavingCapacityPoint[] = []

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

  const currentFilters = useMemo(
    () => withoutOperationAndPeriodFilters(filters),
    [filters],
  )
  const latestAccountPositions = useMemo(
    () => applyPositionFilters(positions, currentFilters),
    [currentFilters, positions],
  )
  const positionsAtPeriodEnd = useMemo(
    () => buildPositionRows(rawOperations, rawPositions, filters.dateTo),
    [filters.dateTo, rawOperations, rawPositions],
  )
  const currentPositions = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, currentFilters),
    [currentFilters, positionsAtPeriodEnd],
  )
  const periodEndFundHoldings = useMemo(
    () => filters.dateTo
      ? selectHistoricalFundHoldingsAtDate(fundData.history, filters.dateTo)
      : fundData.holdings,
    [filters.dateTo, fundData.history, fundData.holdings],
  )
  const tableFiltered = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, filters),
    [filters, positionsAtPeriodEnd],
  )
  const periodPositions = useMemo(
    () => applyPositionFilters(positionsAtPeriodEnd, withoutOperationFilters(filters)),
    [filters, positionsAtPeriodEnd],
  )
  const tableData = useMemo(
    () => sortPositionsForTable(
      tableFiltered,
      filters.hideClosedPositions,
      allAccountTypes,
      sortKey,
      sortDir,
    ),
    [allAccountTypes, filters.hideClosedPositions, sortDir, sortKey, tableFiltered],
  )

  const fallbackAccountHistory = useMemo(
    () => applyAccountFilterToHistory(allPositionRows, enrichedHistory, filters.accounts),
    [allPositionRows, enrichedHistory, filters.accounts],
  )
  const filteredHistory = useFilteredPortfolioHistory(fallbackAccountHistory, filters.accounts)
  const accountHistory = filteredHistory.history
  const displayedHistory = useMemo(
    () => filterPointsByPeriod(accountHistory, filters.dateFrom, filters.dateTo),
    [accountHistory, filters.dateFrom, filters.dateTo],
  )
  const globalTri = displayedHistory.at(-1)?.tri ?? null
  let irrStatus: 'loading' | 'error' | 'ready' = 'ready'
  if (filteredHistory.loading) irrStatus = 'loading'
  else if (filteredHistory.error) irrStatus = 'error'
  const irrScopeLabel = filteredHistory.isFiltered && irrStatus === 'ready'
    ? 'Selected accounts'
    : undefined
  const demoPresetSelection = useMemo(
    () => buildDemoPresetSelection(allAccounts, filteredHistory.demoPresetAccounts),
    [allAccounts, filteredHistory.demoPresetAccounts],
  )
  const demoPresetActive = useMemo(
    () => isDemoPresetActive(filters.accounts, filteredHistory.demoPresetAccounts),
    [filteredHistory.demoPresetAccounts, filters.accounts],
  )

  const savingCapacityQuery = useSavingCapacity(filters.accounts)
  const savingCapacity = savingCapacityQuery.data ?? EMPTY_SAVING_CAPACITY
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
      filters.accountTypes,
      filters.accounts,
      filters.dateFrom,
      filters.dateTo,
      fundData.history,
      rawOperations,
      rawPositions,
      savingCapacity,
    ],
  )
  const rollingThreeYearTriComparison = useMemo(
    () => overviewComparison
      ? compareRollingThreeYearIrr(accountHistory, overviewComparison.windows)
      : { current: null, previous: null, delta: null, deltaPct: null },
    [accountHistory, overviewComparison],
  )
  const periodSavings = useMemo(
    () => filterPointsByPeriod(savingCapacity, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, savingCapacity],
  )
  const trailingSavings = useMemo(
    () => computeTrailing12mSavings(savingCapacity, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, savingCapacity],
  )
  const trailingYearComparison = useMemo(
    () => computeTrailing12mYearOverYear(savingCapacity, filters.dateTo),
    [filters.dateTo, savingCapacity],
  )
  const wealthDrivers = useMemo(
    () => buildCumulativeWealthDrivers(periodSavings),
    [periodSavings],
  )
  const monthlyOps = useMemo(
    () => filterMonthlyOpsByAccounts(allMonthlyOps, filters.accounts),
    [allMonthlyOps, filters.accounts],
  )
  const passiveIncomeQuery = usePassiveIncome(
    filters.accounts,
    filters.dateFrom,
    filters.dateTo,
  )
  const passiveIncome = passiveIncomeQuery.data ?? EMPTY_PASSIVE_INCOME
  const typeHistory = useAccountTypeHistory(filters.accounts)
  const displayedTypeHistory = useMemo(
    () => filterPointsByPeriod(typeHistory.data, filters.dateFrom, filters.dateTo),
    [filters.dateFrom, filters.dateTo, typeHistory.data],
  )
  const accountTypeData = useMemo(
    () => buildAccountTypeBreakdown(currentPositions),
    [currentPositions],
  )
  const displayedAnnualIncomeSavings = useMemo(
    () => filterAnnualIncomeSavingsByPeriod(
      annualIncomeSavings,
      filters.dateFrom,
      filters.dateTo,
    ),
    [annualIncomeSavings, filters.dateFrom, filters.dateTo],
  )
  const asOfPerformance = useMemo(
    () => computePerformanceSummary(currentPositions),
    [currentPositions],
  )
  const periodPerformance = useMemo(
    () => computePerformanceSummary(periodPositions),
    [periodPositions],
  )
  const performance = useMemo(
    () => ({
      ...asOfPerformance,
      realizedNet: periodPerformance.realizedNet,
      realizedGross: periodPerformance.realizedGross,
    }),
    [asOfPerformance, periodPerformance],
  )
  const trailingIncome = useMemo(
    () => computeTrailing12mIncome(currentPositions, displayedHistory.at(-1)?.date),
    [currentPositions, displayedHistory],
  )
  const coverage = useMemo(
    () => rawAllocationData.loading
      ? []
      : computeAllocationCoverageByAccount(latestAccountPositions, rawAllocationData),
    [latestAccountPositions, rawAllocationData],
  )
  const scopedFundQuality = useMemo(
    () => scopeFundQualityData(
      latestAccountPositions,
      fundData.holdings,
      fundData.statuses,
      fundData.snapshots,
      fundData.unresolved,
      fundData.report,
    ),
    [
      fundData.holdings,
      fundData.report,
      fundData.snapshots,
      fundData.statuses,
      fundData.unresolved,
      latestAccountPositions,
    ],
  )
  const pipelineQualityPositions = activeTab === 'holdings' && holdingsView === 'positions'
    ? tableFiltered
    : latestAccountPositions
  const scopedPipelineErrors = useMemo(
    () => scopePipelineErrors(pipelineErrors, pipelineQualityPositions, filters),
    [filters, pipelineErrors, pipelineQualityPositions],
  )
  const scopedManualPriceOverrides = useMemo(
    () => scopeManualPriceOverrides(manualPriceOverrides, latestAccountPositions, filters),
    [filters, latestAccountPositions, manualPriceOverrides],
  )
  const qualitySummary = useMemo(
    () => buildDashboardQualitySummary({
      allocationLoading: rawAllocationData.loading,
      coverage,
      pipelineErrorsLoading,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    }),
    [
      coverage,
      pipelineErrorsLoading,
      rawAllocationData.loading,
      scopedFundQuality,
      scopedManualPriceOverrides,
      scopedPipelineErrors,
    ],
  )

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

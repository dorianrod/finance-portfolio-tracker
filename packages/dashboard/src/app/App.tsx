import { useEffect, useMemo, useState } from 'react'
import { useData } from '@/hooks/useData'
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory'
import { useCashHistory } from '@/hooks/useCashHistory'
import { useAllPositions } from '@/hooks/useAllPositions'
import { useErrors } from '@/hooks/useErrors'
import { useManualPriceOverrides } from '@/hooks/useManualPriceOverrides'
import {
  normalizeAccountSelection,
  useFilteredPortfolioHistory,
} from '@/hooks/useFilteredPortfolioHistory'
import { useMonthlyOps } from '@/hooks/useMonthlyOps'
import { useSavingCapacity } from '@/hooks/useSavingCapacity'
import { usePassiveIncome } from '@/hooks/usePassiveIncome'
import { useAccountTypeHistory } from '@/hooks/useAccountTypeHistory'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { useFundHoldingsData } from '@/hooks/useFundHoldings'
import { PositionsTable } from '@/features/positions-table/PositionsTable'
import { FilterBar } from '@/features/filters/FilterBar'
import { AllocationCharts } from '@/features/allocation-charts/AllocationCharts'
import { FilterChipBar } from '@/features/allocation-charts/FilterChipBar'
import { computeAllocationCoverageByAccount } from '@/features/allocation-charts/allocationCoverage.logic'
import type { AllocationFilter } from '@/features/allocation-charts/allocationCharts.types'
import { OverviewTab } from '@/features/dashboard/OverviewTab'
import { WealthTab } from '@/features/dashboard/WealthTab'
import { PerformanceTab } from '@/features/dashboard/PerformanceTab'
import { DataQualityTab } from '@/features/dashboard/DataQualityTab'
import { FundLookThroughTab } from '@/features/fund-holdings/FundLookThroughTab'
import type { Filters, SortKey } from '@/types/filters'
import { accountFilterId, rawAccountId } from '@/shared/filters/accountFilter'
import { accountLabel } from '@/features/filters/filterBar.logic'
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
} from '@/features/portfolio-charts/portfolioCharts.logic'
import {
  applyPositionFilters,
  applyAccountFilterToHistory,
  buildAccountTypeBreakdown,
  sortPositionsForTable,
} from './app.logic'

type AnalysisTab = 'overview' | 'wealth' | 'performance' | 'allocation' | 'underlying' | 'positions' | 'quality'

const PRIMARY_TABS: Array<{ id: Exclude<AnalysisTab, 'quality'>; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'wealth', label: 'Wealth & cash flow' },
  { id: 'performance', label: 'Performance & passive income' },
  { id: 'allocation', label: 'Allocation & risk' },
  { id: 'underlying', label: 'Underlying assets' },
  { id: 'positions', label: 'Positions' },
]

const TAB_COPY: Record<AnalysisTab, { title: string; description: string }> = {
  overview: { title: 'Portfolio overview', description: 'Current position, recent change drivers and the main signals to review.' },
  wealth: { title: 'Wealth & cash flow', description: 'How contributions and market performance built the portfolio over time.' },
  performance: { title: 'Performance & passive income', description: 'Returns, realized outcomes and recurring passive income.' },
  allocation: { title: 'Allocation & risk', description: 'Current exposures, concentration and how the mix is evolving.' },
  underlying: { title: 'Underlying assets', description: 'All identified economic exposure through ETFs and funds, grouped by issuer and security.' },
  positions: { title: 'Positions', description: 'Inspect every holding, transaction and position-level result.' },
  quality: { title: 'Data quality', description: 'Allocation coverage, pipeline anomalies and manual price overrides.' },
}

function periodLabel(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return ''
  if (dateFrom && dateTo) return `${dateFrom} to ${dateTo}`
  if (dateFrom) return `Since ${dateFrom}`
  return `Until ${dateTo}`
}

export default function App() {
  const { positions, rawPositions, rawOperations, accountLabels, loading, error } = useData()
  const { history } = usePortfolioHistory()
  const { cashHistory } = useCashHistory()
  const allPositionRows = useAllPositions()
  const { errors: pipelineErrors } = useErrors()
  const { manualPriceOverrides } = useManualPriceOverrides()
  const allMonthlyOps = useMonthlyOps()
  const rawAllocationData = useRawIsinData()
  const fundData = useFundHoldingsData()
  const fundHoldings = fundData.holdings

  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview')
  const [allocationFilter, setAllocationFilter] = useState<AllocationFilter | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('total_value')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<Filters>({
    accountTypes: new Set<string>(),
    accounts: new Set<string>(),
    operationTypes: new Set<string>(),
    hideClosedPositions: true,
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const enrichedHistory = useMemo(() => {
    const cashByDate = new Map(cashHistory.map((cash) => [cash.date, cash.total_broker_cash]))
    return history.map((point) => ({ ...point, total_broker_cash: cashByDate.get(point.date) ?? 0 }))
  }, [history, cashHistory])

  const allAccountTypes = useMemo(
    () => [...new Set(positions.map((position) => position.account_type).filter((type): type is string => !!type))].sort(),
    [positions],
  )
  const accountToType = useMemo(() => {
    const map: Record<string, string> = {}
    for (const position of positions) if (position.account_type) map[accountFilterId(position)] = position.account_type
    return map
  }, [positions])
  const allAccounts = useMemo(() => [...new Set(positions.map(accountFilterId))].sort(), [positions])
  const accountFilterLabels = useMemo(() => {
    const labels = { ...accountLabels }
    for (const position of positions) {
      const id = accountFilterId(position)
      if (!labels[id]) labels[id] = id === position.account ? accountLabel(position.account, accountLabels) : position.name
    }
    return labels
  }, [positions, accountLabels])
  const allOperationTypes = useMemo(
    () => [...new Set(positions.flatMap((position) => [...position.operationTypes]))].sort(),
    [positions],
  )

  const currentFilters = useMemo<Filters>(() => ({
    ...filters,
    operationTypes: new Set<string>(),
    hideClosedPositions: false,
    dateFrom: undefined,
    dateTo: undefined,
  }), [filters])
  const currentPositions = useMemo(
    () => applyPositionFilters(positions, currentFilters),
    [positions, currentFilters],
  )
  const tableFiltered = useMemo(
    () => applyPositionFilters(positions, filters),
    [positions, filters],
  )
  const tableData = useMemo(
    () => sortPositionsForTable(tableFiltered, filters.hideClosedPositions, allAccountTypes, sortKey, sortDir),
    [tableFiltered, filters.hideClosedPositions, allAccountTypes, sortKey, sortDir],
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
  const globalTri = displayedHistory[displayedHistory.length - 1]?.tri ?? null
  const irrStatus = filteredHistory.loading ? 'loading' : filteredHistory.error ? 'error' : 'ready'
  const irrScopeLabel = filteredHistory.isFiltered && irrStatus === 'ready' ? 'Selected accounts' : undefined
  const demoPresetSelection = useMemo(() => {
    if (!filteredHistory.demoPresetAccounts) return null
    const included = new Set(filteredHistory.demoPresetAccounts)
    return new Set(allAccounts.filter((account) => included.has(rawAccountId(account))))
  }, [allAccounts, filteredHistory.demoPresetAccounts])
  const demoPresetActive = useMemo(() => {
    if (!filteredHistory.demoPresetAccounts) return false
    const selected = normalizeAccountSelection(filters.accounts)
    return selected.length === filteredHistory.demoPresetAccounts.length
      && selected.every((account, index) => account === filteredHistory.demoPresetAccounts?.[index])
  }, [filteredHistory.demoPresetAccounts, filters.accounts])

  const savingCapacity = useSavingCapacity(filters.accounts)
  const periodSavings = useMemo(
    () => filterPointsByPeriod(savingCapacity, filters.dateFrom, filters.dateTo),
    [savingCapacity, filters.dateFrom, filters.dateTo],
  )
  const trailingSavings = useMemo(() => computeTrailing12mSavings(periodSavings), [periodSavings])
  const trailingYearComparison = useMemo(() => computeTrailing12mYearOverYear(savingCapacity), [savingCapacity])
  const wealthDrivers = useMemo(() => buildCumulativeWealthDrivers(periodSavings), [periodSavings])
  const drivers = useMemo(() => computePeriodDrivers(periodSavings), [periodSavings])
  const monthlyOps = useMemo(() => filterMonthlyOpsByAccounts(allMonthlyOps, filters.accounts), [allMonthlyOps, filters.accounts])
  const passiveIncome = usePassiveIncome(filters.accounts, filters.dateFrom, filters.dateTo)
  const typeHistory = useAccountTypeHistory(filters.accounts)
  const displayedTypeHistory = useMemo(
    () => filterPointsByPeriod(typeHistory.data, filters.dateFrom, filters.dateTo),
    [typeHistory.data, filters.dateFrom, filters.dateTo],
  )

  const accountTypeData = useMemo(() => buildAccountTypeBreakdown(currentPositions), [currentPositions])
  const performance = useMemo(() => computePerformanceSummary(currentPositions), [currentPositions])
  const trailingIncome = useMemo(
    () => computeTrailing12mIncome(currentPositions, displayedHistory.at(-1)?.date),
    [currentPositions, displayedHistory],
  )
  const lookThroughConcentration = useMemo(
    () => computeConcentration(tableFiltered, fundHoldings),
    [tableFiltered, fundHoldings],
  )
  const heldAssetConcentration = useMemo(
    () => computeHeldAssetConcentration(tableFiltered),
    [tableFiltered],
  )
  const coverage = useMemo(
    () => rawAllocationData.loading ? [] : computeAllocationCoverageByAccount(currentPositions, rawAllocationData),
    [currentPositions, rawAllocationData],
  )
  const unallocatedPct = useMemo(() => {
    if (rawAllocationData.loading) return null
    const allocated = coverage.reduce((sum, item) => sum + item.allocated, 0)
    const unallocated = coverage.reduce((sum, item) => sum + item.unallocated, 0)
    return allocated + unallocated > 0 ? unallocated / (allocated + unallocated) * 100 : 0
  }, [coverage, rawAllocationData.loading])

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((direction) => direction === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const fundQualityCount = fundData.statuses.filter((status) => status.validationStatus !== 'ok' || status.residualPct > 0.5).length
  const qualityCount = pipelineErrors.length + manualPriceOverrides.length + fundQualityCount
  const showPeriod = activeTab !== 'quality'
  const copy = TAB_COPY[activeTab]

  return (
    <div className="min-h-screen bg-gray-950 p-4 text-gray-100 sm:p-6">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-5 flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
            <p className="mt-1 text-sm text-gray-500">A decision view of wealth, returns and exposure.</p>
          </div>
          <button onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} className="ml-auto rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </header>

        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && <>
          <nav className="mb-5 flex overflow-x-auto border-b border-gray-800" aria-label="Portfolio analyses">
            {PRIMARY_TABS.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{tab.label}</button>)}
            <button type="button" onClick={() => setActiveTab('quality')} className={`ml-auto flex shrink-0 items-center gap-2 border-b-2 border-l px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'quality' ? 'border-b-blue-500 border-l-gray-800 text-white' : 'border-b-transparent border-l-gray-800 text-gray-500 hover:text-gray-300'}`}>
              Data quality
              {qualityCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${pipelineErrors.some((item) => item.level === 'error') || fundData.statuses.some((item) => item.validationStatus === 'error') ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'}`}>{qualityCount}</span>}
            </button>
          </nav>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">{copy.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{copy.description}</p>
          </div>

          <FilterBar
            allAccountTypes={allAccountTypes}
            accountToType={accountToType}
            allAccounts={allAccounts}
            accountLabels={accountFilterLabels}
            allOperationTypes={allOperationTypes}
            filters={filters}
            onChange={setFilters}
            showPeriod={showPeriod}
            showPositionFilters={activeTab === 'positions'}
          >
            {activeTab === 'allocation' && allocationFilter && (
              <FilterChipBar filter={allocationFilter} onRemove={() => setAllocationFilter(null)} />
            )}
          </FilterBar>

          {demoPresetSelection && (
            <div className="-mt-2 mb-4 flex items-center gap-2">
              <span className="text-xs text-gray-600">Static demo</span>
              <button
                type="button"
                onClick={() => setFilters((current) => ({ ...current, accounts: demoPresetSelection, accountTypes: new Set() }))}
                className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${demoPresetActive ? 'border-blue-600 bg-blue-900/40 text-blue-200' : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
              >
                Exclude private equity
              </button>
            </div>
          )}

          {activeTab === 'overview' && <OverviewTab history={displayedHistory} performance={performance} drivers={drivers} income={trailingIncome} heldAssetConcentration={heldAssetConcentration} lookThroughConcentration={lookThroughConcentration} globalTri={globalTri} irrStatus={irrStatus} irrScopeLabel={irrScopeLabel} periodLabel={periodLabel(filters.dateFrom, filters.dateTo)} anomalyCount={qualityCount} unallocatedPct={unallocatedPct} onNavigate={setActiveTab} />}
          {activeTab === 'wealth' && <WealthTab history={displayedHistory} accountTypeData={accountTypeData} accountTypeHistory={displayedTypeHistory} accountTypes={typeHistory.accountTypes} typeCategories={typeHistory.typeCategories} savings={trailingSavings} monthlyOps={monthlyOps} drivers={wealthDrivers} trailingYearComparison={trailingYearComparison} />}
          {activeTab === 'performance' && <PerformanceTab history={displayedHistory} passiveIncome={passiveIncome} rawPositions={rawPositions} rawOperations={rawOperations} accountFilters={filters.accounts} accountTypeFilters={filters.accountTypes} dateFrom={filters.dateFrom} performance={performance} income={trailingIncome} globalTri={globalTri} irrStatus={irrStatus} irrScopeLabel={irrScopeLabel} />}
          {activeTab === 'allocation' && <AllocationCharts positions={currentPositions} fundHoldings={fundHoldings} fundReport={fundData.report} dateFrom={filters.dateFrom} dateTo={filters.dateTo} activeFilter={allocationFilter} onActiveFilterChange={setAllocationFilter} />}
          {activeTab === 'underlying' && <FundLookThroughTab positions={currentPositions} holdings={fundHoldings} report={fundData.report} />}
          {activeTab === 'positions' && <PositionsTable data={tableData} groupByType={allAccountTypes.length > 0} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} fundHoldings={fundHoldings} fundStatuses={fundData.statuses} onOpenCompleteHoldings={() => setActiveTab('underlying')} />}
          {activeTab === 'quality' && <DataQualityTab positions={currentPositions} accountLabels={accountLabels} errors={pipelineErrors} manualPriceOverrides={manualPriceOverrides} fundStatuses={fundData.statuses} fundReport={fundData.report} />}
        </>}
      </div>
    </div>
  )
}

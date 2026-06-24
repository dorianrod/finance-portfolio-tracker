import { useEffect, useMemo, useState } from 'react'
import { useData } from '@/hooks/useData'
import { usePortfolioHistory } from '@/hooks/usePortfolioHistory'
import { useCashHistory } from '@/hooks/useCashHistory'
import { useAllPositions } from '@/hooks/useAllPositions'
import { useErrors } from '@/hooks/useErrors'
import { PositionsTable } from '@/features/positions-table/PositionsTable'
import { FilterBar } from '@/features/filters/FilterBar'
import { KpiBar } from '@/features/kpis/KpiBar'
import { PortfolioCharts } from '@/features/portfolio-charts/PortfolioCharts'
import { AllocationCharts } from '@/features/allocation-charts/AllocationCharts'
import { ErrorsTab } from '@/features/errors/ErrorsTab'
import type { Filters, SortKey } from '@/types/filters'
import type { PortfolioHistoryPoint } from '@/types/history'
import {
  applyPositionFilters,
  applyAccountFilterToHistory,
  buildAccountTypeBreakdown,
  sortPositionsForTable,
} from './app.logic'

export default function App() {
  const { positions, accountLabels, loading, error } = useData()
  const { history } = usePortfolioHistory()
  const { cashHistory } = useCashHistory()
  const allPositionRows = useAllPositions()
  const { errors: pipelineErrors } = useErrors()

  const enrichedHistory = useMemo(() => {
    const cashByDate = new Map(cashHistory.map((c) => [c.date, c.total_broker_cash]))
    return history.map((pt) => ({
      ...pt,
      total_broker_cash: cashByDate.get(pt.date) ?? 0,
    }))
  }, [history, cashHistory])

  const globalTri = useMemo(() => {
    const last = enrichedHistory[enrichedHistory.length - 1]
    return last?.tri ?? null
  }, [enrichedHistory])

  const allAccountTypes = useMemo(
    () => [...new Set(positions.map((p) => p.account_type).filter((t): t is string => !!t))].sort(),
    [positions]
  )
  const accountToType = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of positions) {
      if (p.account_type) map[p.account] = p.account_type
    }
    return map
  }, [positions])
  const allAccounts = useMemo(
    () => [...new Set(positions.map((p) => p.account))].sort(),
    [positions]
  )
  const allOperationTypes = useMemo(
    () => [...new Set(positions.flatMap((p) => [...p.operationTypes]))].sort(),
    [positions]
  )

  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const [activeTab, setActiveTab] = useState<'charts' | 'allocation' | 'table' | 'errors'>('charts')
  const [sortKey, setSortKey] = useState<SortKey>('total_value')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const [filters, setFilters] = useState<Filters>({
    accountTypes: new Set<string>(),
    accounts: new Set<string>(),
    operationTypes: new Set<string>(),
    hideClosedPositions: true,
  })

  const filtered = useMemo(
    () => applyPositionFilters(positions, filters),
    [positions, filters],
  )

  const filteredHistory = useMemo((): PortfolioHistoryPoint[] =>
    applyAccountFilterToHistory(allPositionRows, enrichedHistory, filters.accounts),
    [allPositionRows, enrichedHistory, filters.accounts],
  )

  const accountTypeData = useMemo(
    () => buildAccountTypeBreakdown(filtered),
    [filtered],
  )

  const tableData = useMemo(
    () => sortPositionsForTable(filtered, filters.hideClosedPositions, allAccountTypes, sortKey, sortDir),
    [filtered, filters.hideClosedPositions, allAccountTypes, sortKey, sortDir],
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && (
          <>
            <FilterBar
              allAccountTypes={allAccountTypes}
              accountToType={accountToType}
              allAccounts={allAccounts}
              accountLabels={accountLabels}
              allOperationTypes={allOperationTypes}
              filters={filters}
              onChange={setFilters}
            />
            <KpiBar rows={filtered} globalTri={globalTri} />
            <div className="flex gap-1 mb-4 border-b border-gray-800">
              {([
                ['charts', 'Charts'],
                ['allocation', 'Allocation'],
                ['table', 'Detailed table'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-gray-900 text-white border border-b-0 border-gray-700'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'errors'
                    ? 'bg-gray-900 text-white border border-b-0 border-gray-700'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Anomalies
                {pipelineErrors.length > 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    pipelineErrors.some((e) => e.level === 'error')
                      ? 'bg-red-800 text-red-200'
                      : 'bg-yellow-800 text-yellow-200'
                  }`}>
                    {pipelineErrors.length}
                  </span>
                )}
              </button>
            </div>
            {activeTab === 'charts' && filteredHistory.length > 0 && (
              <PortfolioCharts history={filteredHistory} accounts={filters.accounts} accountTypeData={accountTypeData} positions={filtered} dateFrom={filters.dateFrom} dateTo={filters.dateTo} />
            )}
            {activeTab === 'allocation' && (
              <AllocationCharts />
            )}
            {activeTab === 'table' && (
              <PositionsTable data={tableData} groupByType={allAccountTypes.length > 0} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
            )}
            {activeTab === 'errors' && (
              <ErrorsTab errors={pipelineErrors} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

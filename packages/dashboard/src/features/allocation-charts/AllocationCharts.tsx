import { useState, useMemo } from 'react'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { aggregateAllocationPoints, computeMatchingIsins, aggregateFilteredPoints, computeTableRows, excludeNonApplicableAllocationData, scopeRawAllocationData } from './allocationCharts.logic'
import { DonutCard } from './DonutCard'
import { EvoCard } from './EvoCard'
import { FilteredPositionsTable } from './FilteredPositionsTable'
import type { AllocationFilter } from './allocationCharts.types'
import type { PositionRow } from '@/types/domain'
import { computeConcentration, computeHeldAssetConcentration } from '@/features/portfolio-charts/portfolioCharts.logic'
import { ConcentrationChart } from '@/features/portfolio-charts/ConcentrationChart'
import type { FundCoverageReport, FundHolding } from '@/hooks/useFundHoldings'
import { ConcentrationModeToggle, type ConcentrationMode } from '@/features/portfolio-charts/ConcentrationModeToggle'
import { LookThroughCoverageSummary } from '@/features/fund-holdings/LookThroughCoverageSummary'
import { fmtFull } from '@/shared/format/money'
import { isAssetAnalysisApplicablePosition } from '@/shared/quality/accountApplicability'

interface AllocationChartsProps {
  positions: PositionRow[]
  fundHoldings: FundHolding[]
  fundReport: FundCoverageReport | null
  accountFilters: Set<string>
  dateFrom?: string
  dateTo?: string
  activeFilter: AllocationFilter | null
  onActiveFilterChange: (filter: AllocationFilter | null) => void
}

export function AllocationCharts({ positions, fundHoldings, fundReport, accountFilters, dateFrom, dateTo, activeFilter, onActiveFilterChange }: AllocationChartsProps) {
  const rawData = useRawIsinData()

  const [showTable, setShowTable] = useState(false)
  const [view, setView] = useState<'current' | 'trend'>('current')
  const [concentrationMode, setConcentrationMode] = useState<ConcentrationMode>('held')
  const applicablePositions = useMemo(
    () => positions.filter((position) => isAssetAnalysisApplicablePosition(position)),
    [positions],
  )
  const hasSelectedValue = positions.some(
    (position) => position.status === 'active' && (position.total_value ?? 0) > 0,
  )
  const hasApplicableValue = applicablePositions.some(
    (position) => position.status === 'active' && (position.total_value ?? 0) > 0,
  )
  const notApplicableValue = positions.reduce((sum, position) => (
    position.status === 'active' && !isAssetAnalysisApplicablePosition(position)
      ? sum + Math.max(0, position.total_value ?? 0)
      : sum
  ), 0)
  const lookThroughConcentration = useMemo(
    () => computeConcentration(applicablePositions, fundHoldings),
    [applicablePositions, fundHoldings],
  )
  const heldAssetConcentration = useMemo(
    () => computeHeldAssetConcentration(applicablePositions),
    [applicablePositions],
  )
  const concentration = concentrationMode === 'held' ? heldAssetConcentration : lookThroughConcentration
  const accountScopedRawData = useMemo(
    () => scopeRawAllocationData(rawData, accountFilters),
    [rawData, accountFilters],
  )
  const scopedRawData = useMemo(
    () => excludeNonApplicableAllocationData(accountScopedRawData, positions),
    [accountScopedRawData, positions],
  )
  const baseGeo = useMemo(
    () => aggregateAllocationPoints(scopedRawData.geo),
    [scopedRawData.geo],
  )
  const baseSecteur = useMemo(
    () => aggregateAllocationPoints(scopedRawData.secteur),
    [scopedRawData.secteur],
  )
  const baseCurrency = useMemo(
    () => aggregateAllocationPoints(scopedRawData.currency),
    [scopedRawData.currency],
  )
  const baseClasse = useMemo(
    () => aggregateAllocationPoints(scopedRawData.classe),
    [scopedRawData.classe],
  )

  function handleFilterToggle(filter: AllocationFilter) {
    const isSameFilter = activeFilter?.type === filter.type && activeFilter?.value === filter.value
    setShowTable(false)
    onActiveFilterChange(isSameFilter ? null : filter)
  }

  const matchingIsins = useMemo(
    () => computeMatchingIsins(scopedRawData, activeFilter),
    [scopedRawData, activeFilter],
  )

  const displayGeo = useMemo(() => {
    if (!activeFilter || scopedRawData.loading) return baseGeo
    const pts = aggregateFilteredPoints(scopedRawData.geo, matchingIsins, activeFilter.type === 'geo' ? activeFilter.value : undefined)
    return pts.length ? pts : baseGeo
  }, [activeFilter, scopedRawData, matchingIsins, baseGeo])

  const displaySecteur = useMemo(() => {
    if (!activeFilter || scopedRawData.loading) return baseSecteur
    const pts = aggregateFilteredPoints(scopedRawData.secteur, matchingIsins, activeFilter.type === 'secteur' ? activeFilter.value : undefined)
    return pts.length ? pts : baseSecteur
  }, [activeFilter, scopedRawData, matchingIsins, baseSecteur])

  const displayCurrency = useMemo(() => {
    if (!activeFilter || scopedRawData.loading) return baseCurrency
    const pts = aggregateFilteredPoints(scopedRawData.currency, matchingIsins, activeFilter.type === 'currency' ? activeFilter.value : undefined)
    return pts.length ? pts : baseCurrency
  }, [activeFilter, scopedRawData, matchingIsins, baseCurrency])

  const displayClasse = useMemo(() => {
    if (!activeFilter || scopedRawData.loading) return baseClasse
    const pts = aggregateFilteredPoints(scopedRawData.classe, matchingIsins, activeFilter.type === 'classe' ? activeFilter.value : undefined)
    return pts.length ? pts : baseClasse
  }, [activeFilter, scopedRawData, matchingIsins, baseClasse])

  const tableRows = useMemo(() => {
    if (!activeFilter || scopedRawData.loading) return []
    return computeTableRows(scopedRawData, matchingIsins, activeFilter)
  }, [activeFilter, scopedRawData, matchingIsins])

  if (rawData.loading) return <p className="text-gray-400 text-sm">Loading breakdowns…</p>

  if (hasSelectedValue && !hasApplicableValue) {
    return <p className="text-sm text-gray-500">Diversification is not applicable to savings, checking and brokerage-cash accounts.</p>
  }

  if (!baseGeo.length && !baseSecteur.length && !baseCurrency.length && !baseClasse.length) {
    return <p className="text-gray-500 text-sm">No allocation data available. Run the pipeline to generate the files.</p>
  }

  const latestGeo      = displayGeo[displayGeo.length - 1]
  const latestSecteur  = displaySecteur[displaySecteur.length - 1]
  const latestCurrency = displayCurrency[displayCurrency.length - 1]
  const latestClasse   = displayClasse[displayClasse.length - 1]

  const inPeriod = <T extends { date: string }>(points: T[]) => points.filter((point) => {
    if (dateFrom && point.date < dateFrom) return false
    if (dateTo && point.date > dateTo) return false
    return true
  })
  const trendGeo = inPeriod(displayGeo)
  const trendSecteur = inPeriod(displaySecteur)
  const trendCurrency = inPeriod(displayCurrency)
  const trendClasse = inPeriod(displayClasse)

  const hasEvolution = Math.max(
    trendGeo.length, trendSecteur.length, trendCurrency.length, trendClasse.length,
  ) >= 2

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Portfolio exposure</h2>
          <p className="mt-1 text-xs text-gray-500">Analyse the current mix or how it changed over time.</p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-800 bg-gray-900 p-1">
          <button type="button" onClick={() => setView('current')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === 'current' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Current</button>
          <button type="button" onClick={() => setView('trend')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === 'trend' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Trend</button>
        </div>
      </div>

      {view === 'current' && (
        <>
          {concentrationMode === 'lookThrough' && <LookThroughCoverageSummary report={fundReport} compact notApplicableValue={notApplicableValue} />}
          {concentration.holdings.length > 0 && <ConcentrationChart data={concentration.holdings} topTenValue={concentration.topTenValue} topTenPct={concentration.topTenPct} description={concentrationMode === 'held' ? 'Assets effectively held, aggregated across accounts.' : `Identified ${fmtFull(concentration.identifiedValue)} · undisclosed funds ${fmtFull(concentration.undisclosedValue)} · opaque ${fmtFull(concentration.opaqueValue)}.`} action={<ConcentrationModeToggle value={concentrationMode} onChange={setConcentrationMode} />} />}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {latestGeo && <DonutCard title="Geography" point={latestGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
            {latestClasse && <DonutCard title="Asset class" point={latestClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
            {latestSecteur && <DonutCard title="Sector" point={latestSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
            {latestCurrency && <DonutCard title="Currency (equities + fixed income)" point={latestCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
          </div>
        </>
      )}

      {view === 'trend' && hasEvolution && <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {trendGeo.length >= 2 && <EvoCard title="Geography" points={trendGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} dateFrom={dateFrom} dateTo={dateTo} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
        {trendClasse.length >= 2 && <EvoCard title="Asset class" points={trendClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} dateFrom={dateFrom} dateTo={dateTo} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
        {trendSecteur.length >= 2 && <EvoCard title="Sector" points={trendSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} dateFrom={dateFrom} dateTo={dateTo} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
        {trendCurrency.length >= 2 && <EvoCard title="Currency" points={trendCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} dateFrom={dateFrom} dateTo={dateTo} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
      </div>}
      {view === 'trend' && !hasEvolution && <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">Not enough allocation history in the selected period.</div>}

      {/* ── Panneau positions ─────────────────────────────────────────────── */}
      {showTable && activeFilter && tableRows.length > 0 && (
        <FilteredPositionsTable
          rows={tableRows}
          filter={activeFilter}
          onClearFilter={() => {
            setShowTable(false)
            onActiveFilterChange(null)
          }}
          onClose={() => setShowTable(false)}
        />
      )}

    </div>
  )
}

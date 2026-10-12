import { useState, useMemo } from 'react'
import { useAllocationData } from '@/hooks/useAllocationData'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { computeMatchingIsins, aggregateFilteredPoints, computeTableRows } from './allocationCharts.logic'
import { DonutCard } from './DonutCard'
import { EvoCard } from './EvoCard'
import { FilterChipBar } from './FilterChipBar'
import { FilteredPositionsTable } from './FilteredPositionsTable'
import type { AllocationFilter } from './allocationCharts.types'
import type { PositionRow } from '@/types/domain'
import { computeConcentration } from '@/features/portfolio-charts/portfolioCharts.logic'
import { ConcentrationChart } from '@/features/portfolio-charts/ConcentrationChart'

interface AllocationChartsProps {
  positions: PositionRow[]
  dateFrom?: string
  dateTo?: string
}

export function AllocationCharts({ positions, dateFrom, dateTo }: AllocationChartsProps) {
  const { geo, secteur, currency, classe, loading: loadingAgg } = useAllocationData()
  const rawData = useRawIsinData()

  const [activeFilter, setActiveFilter] = useState<AllocationFilter | null>(null)
  const [showTable, setShowTable] = useState(false)
  const [view, setView] = useState<'current' | 'trend'>('current')
  const concentration = useMemo(() => computeConcentration(positions), [positions])

  function handleFilterToggle(filter: AllocationFilter) {
    setActiveFilter((prev) => {
      if (prev?.type === filter.type && prev?.value === filter.value) {
        setShowTable(false)
        return null
      }
      return filter
    })
  }

  function handleRemoveFilter() {
    setActiveFilter(null)
    setShowTable(false)
  }

  const matchingIsins = useMemo(
    () => computeMatchingIsins(rawData, activeFilter),
    [rawData, activeFilter],
  )

  const displayGeo = useMemo(() => {
    if (!activeFilter || rawData.loading) return geo
    const pts = aggregateFilteredPoints(rawData.geo, matchingIsins, activeFilter.type === 'geo' ? activeFilter.value : undefined)
    return pts.length ? pts : geo
  }, [activeFilter, rawData, matchingIsins, geo])

  const displaySecteur = useMemo(() => {
    if (!activeFilter || rawData.loading) return secteur
    const pts = aggregateFilteredPoints(rawData.secteur, matchingIsins, activeFilter.type === 'secteur' ? activeFilter.value : undefined)
    return pts.length ? pts : secteur
  }, [activeFilter, rawData, matchingIsins, secteur])

  const displayCurrency = useMemo(() => {
    if (!activeFilter || rawData.loading) return currency
    const pts = aggregateFilteredPoints(rawData.currency, matchingIsins, activeFilter.type === 'currency' ? activeFilter.value : undefined)
    return pts.length ? pts : currency
  }, [activeFilter, rawData, matchingIsins, currency])

  const displayClasse = useMemo(() => {
    if (!activeFilter || rawData.loading) return classe
    const pts = aggregateFilteredPoints(rawData.classe, matchingIsins, activeFilter.type === 'classe' ? activeFilter.value : undefined)
    return pts.length ? pts : classe
  }, [activeFilter, rawData, matchingIsins, classe])

  const tableRows = useMemo(() => {
    if (!activeFilter || rawData.loading) return []
    return computeTableRows(rawData, matchingIsins, activeFilter)
  }, [activeFilter, rawData, matchingIsins])

  if (loadingAgg) return <p className="text-gray-400 text-sm">Loading breakdowns…</p>

  if (!geo.length && !secteur.length && !currency.length && !classe.length) {
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

      {/* ── Active filter ──────────────────────────────────────────────────── */}
      {activeFilter && (
        <FilterChipBar
          filter={activeFilter}
          onRemove={handleRemoveFilter}
          onShowTable={() => setShowTable((s) => !s)}
          tableOpen={showTable}
        />
      )}

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
          {concentration.holdings.length > 0 && <ConcentrationChart data={concentration.holdings} />}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {latestGeo && <DonutCard title="Geography" point={latestGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
            {latestClasse && <DonutCard title="Asset class" point={latestClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
            {latestSecteur && <DonutCard title="Sector" point={latestSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
            {latestCurrency && <DonutCard title="Currency (equities + fixed income)" point={latestCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
          </div>
        </>
      )}

      {view === 'trend' && hasEvolution && <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {trendGeo.length >= 2 && <EvoCard title="Geography" points={trendGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
        {trendClasse.length >= 2 && <EvoCard title="Asset class" points={trendClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
        {trendSecteur.length >= 2 && <EvoCard title="Sector" points={trendSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
        {trendCurrency.length >= 2 && <EvoCard title="Currency" points={trendCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
      </div>}
      {view === 'trend' && !hasEvolution && <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">Not enough allocation history in the selected period.</div>}

      {/* ── Panneau positions ─────────────────────────────────────────────── */}
      {showTable && activeFilter && tableRows.length > 0 && (
        <FilteredPositionsTable
          rows={tableRows}
          filter={activeFilter}
          onClose={() => setShowTable(false)}
        />
      )}

    </div>
  )
}

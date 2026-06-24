import { useState, useMemo } from 'react'
import { useAllocationData } from '@/hooks/useAllocationData'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { computeMatchingIsins, aggregateFilteredPoints, computeTableRows } from './allocationCharts.logic'
import { DonutCard } from './DonutCard'
import { EvoCard } from './EvoCard'
import { FilterChipBar } from './FilterChipBar'
import { FilteredPositionsTable } from './FilteredPositionsTable'
import type { AllocationFilter } from './allocationCharts.types'

export function AllocationCharts() {
  const { geo, secteur, currency, classe, loading: loadingAgg } = useAllocationData()
  const rawData = useRawIsinData()

  const [activeFilter, setActiveFilter] = useState<AllocationFilter | null>(null)
  const [showTable, setShowTable] = useState(false)

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

  const hasEvolution = Math.max(
    displayGeo.length, displaySecteur.length, displayCurrency.length, displayClasse.length,
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

      {/* ── Current breakdown ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {latestGeo && <DonutCard title="Geography" point={latestGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
        {latestClasse && <DonutCard title="Asset class" point={latestClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
        {latestSecteur && <DonutCard title="Sector" point={latestSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
        {latestCurrency && <DonutCard title="Currency (equities + fixed income)" point={latestCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
      </div>

      {/* ── Trend ────────────────────────────────────────────────────── */}
      {hasEvolution && (
        <>
          <p className="text-xs text-gray-600 -mb-2">Monthly trend (allocated amounts)</p>
          <div className="grid grid-cols-2 gap-4">
            {displayGeo.length >= 2 && <EvoCard title="Geography" points={displayGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
            {displayClasse.length >= 2 && <EvoCard title="Asset class" points={displayClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
            {displaySecteur.length >= 2 && <EvoCard title="Sector" points={displaySecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
            {displayCurrency.length >= 2 && <EvoCard title="Currency" points={displayCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} />}
          </div>
        </>
      )}

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

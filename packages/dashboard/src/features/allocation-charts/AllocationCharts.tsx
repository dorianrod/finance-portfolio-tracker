import { useState, useMemo } from 'react'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { aggregateAllocationPoints, computeMatchingIsins, aggregateFilteredPoints, computeTableRows, excludeNonApplicableAllocationData, scopeRawAllocationData } from './allocationCharts.logic'
import { DonutCard } from './DonutCard'
import { EvoCard } from './EvoCard'
import { FilteredPositionsTable } from './FilteredPositionsTable'
import type { AllocationFilter } from './allocationCharts.types'
import type { PositionRow, RawPosition } from '@/types/domain'
import { buildCumulativeConcentration, computeConcentration, computeHeldAssetConcentration } from '@/features/portfolio-charts/portfolioCharts.logic'
import { ConcentrationChart } from '@/features/portfolio-charts/ConcentrationChart'
import { CumulativeConcentrationChart } from '@/features/portfolio-charts/CumulativeConcentrationChart'
import type { FundHolding } from '@/hooks/useFundHoldings'
import { ConcentrationModeToggle, type ConcentrationMode } from '@/features/portfolio-charts/ConcentrationModeToggle'
import { fmtFull } from '@/shared/format/money'
import { isAssetAnalysisApplicablePosition } from '@/shared/quality/accountApplicability'
import { ConcentrationTrendSection } from './ConcentrationTrendSection'
import { buildAnnualConcentrationFrames, buildHistoricalConcentration } from './concentrationTrend.logic'

interface AllocationChartsProps {
  positions: PositionRow[]
  rawPositions: RawPosition[]
  fundHoldings: FundHolding[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  activeFilter: AllocationFilter | null
  onActiveFilterChange: (filter: AllocationFilter | null) => void
  view: AllocationView
}

export type AllocationView = 'current' | 'trend'

interface AllocationViewToggleProps {
  value: AllocationView
  onChange: (view: AllocationView) => void
}

export function AllocationViewToggle({ value, onChange }: AllocationViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-800 bg-gray-900 p-1" role="group" aria-label="Diversification view">
      <button type="button" onClick={() => onChange('current')} aria-pressed={value === 'current'} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === 'current' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Current</button>
      <button type="button" onClick={() => onChange('trend')} aria-pressed={value === 'trend'} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === 'trend' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Trend</button>
    </div>
  )
}

export function AllocationCharts({ positions, rawPositions, fundHoldings, accountFilters, accountTypeFilters, activeFilter, onActiveFilterChange, view }: AllocationChartsProps) {
  const rawData = useRawIsinData()

  const [showTable, setShowTable] = useState(false)
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
  const lookThroughConcentration = useMemo(
    () => computeConcentration(applicablePositions, fundHoldings),
    [applicablePositions, fundHoldings],
  )
  const heldAssetConcentration = useMemo(
    () => computeHeldAssetConcentration(applicablePositions),
    [applicablePositions],
  )
  const concentration = concentrationMode === 'held' ? heldAssetConcentration : lookThroughConcentration
  const cumulativeConcentration = useMemo(
    () => buildCumulativeConcentration(concentration.allHoldings),
    [concentration],
  )
  const concentrationHistory = useMemo(
    () => buildHistoricalConcentration(rawPositions, accountFilters, accountTypeFilters),
    [rawPositions, accountFilters, accountTypeFilters],
  )
  const annualConcentrationFrames = useMemo(
    () => buildAnnualConcentrationFrames(concentrationHistory),
    [concentrationHistory],
  )
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

  if (view === 'current' && !baseGeo.length && !baseSecteur.length && !baseCurrency.length && !baseClasse.length) {
    return <p className="text-gray-500 text-sm">No allocation data available. Run the pipeline to generate the files.</p>
  }

  const latestGeo      = displayGeo[displayGeo.length - 1]
  const latestSecteur  = displaySecteur[displaySecteur.length - 1]
  const latestCurrency = displayCurrency[displayCurrency.length - 1]
  const latestClasse   = displayClasse[displayClasse.length - 1]

  const trendGeo = displayGeo
  const trendSecteur = displaySecteur
  const trendCurrency = displayCurrency
  const trendClasse = displayClasse

  const hasEvolution = Math.max(
    trendGeo.length, trendSecteur.length, trendCurrency.length, trendClasse.length,
  ) >= 2

  return (
    <div className="flex flex-col gap-4 mb-6">
      {view === 'current' && (
        <>
          {(heldAssetConcentration.allHoldings.length > 0 || lookThroughConcentration.allHoldings.length > 0) && (
            <section>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Asset concentration</h3>
                  <p className="mt-0.5 text-xs text-gray-600">See how much of the portfolio is concentrated in its largest exposures.</p>
                </div>
                <ConcentrationModeToggle value={concentrationMode} onChange={setConcentrationMode} />
              </div>
              {concentration.allHoldings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <CumulativeConcentrationChart
                    data={cumulativeConcentration}
                    description={concentrationMode === 'held'
                      ? 'Share of the applicable portfolio held in the largest N positions.'
                      : `Share of the applicable portfolio identified in the largest N look-through exposures · ${concentration.coveragePct.toFixed(1)}% coverage.`}
                  />
                  <ConcentrationChart
                    data={concentration.holdings}
                    topTenValue={concentration.topTenValue}
                    topTenPct={concentration.topTenPct}
                    description={concentrationMode === 'held'
                      ? 'Positions effectively held, aggregated across accounts.'
                      : `Identified ${fmtFull(concentration.identifiedValue)} · undisclosed funds ${fmtFull(concentration.undisclosedValue)} · opaque ${fmtFull(concentration.opaqueValue)}.`}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">
                  No identified look-through exposure for the current selection.
                </div>
              )}
            </section>
          )}
          <section>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-300">Portfolio breakdown</h3>
              <p className="mt-0.5 text-xs text-gray-600">Explore the current mix by geography, asset class, sector and currency.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {latestGeo && <DonutCard title="Geography" point={latestGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
              {latestClasse && <DonutCard title="Asset class" point={latestClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
              {latestSecteur && <DonutCard title="Sector" point={latestSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
              {latestCurrency && <DonutCard title="Currency (equities + fixed income)" point={latestCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
            </div>
          </section>
        </>
      )}

      {view === 'trend' && (
        <>
          <ConcentrationTrendSection points={concentrationHistory} annualFrames={annualConcentrationFrames} />
          {hasEvolution ? <section>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-300">Portfolio breakdown trends</h3>
              <p className="mt-0.5 text-xs text-gray-600">Track how the mix changed by geography, asset class, sector and currency.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {trendGeo.length >= 2 && <EvoCard title="Geography" points={trendGeo} dimension="geo" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
              {trendClasse.length >= 2 && <EvoCard title="Asset class" points={trendClasse} dimension="classe" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
              {trendSecteur.length >= 2 && <EvoCard title="Sector" points={trendSecteur} dimension="secteur" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
              {trendCurrency.length >= 2 && <EvoCard title="Currency" points={trendCurrency} dimension="currency" activeFilter={activeFilter} onFilterToggle={handleFilterToggle} onShowPositions={() => setShowTable((open) => !open)} positionsOpen={showTable} />}
            </div>
          </section> : <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">Not enough portfolio breakdown history.</div>}
        </>
      )}

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

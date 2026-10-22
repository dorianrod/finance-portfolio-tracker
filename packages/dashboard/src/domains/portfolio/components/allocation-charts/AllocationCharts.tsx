import { useState } from 'react'
import type { RawIsinData } from '@/domains/portfolio/apis/queries/useRawIsinData'
import { DonutCard } from './DonutCard'
import { EvoCard } from './EvoCard'
import { FilteredPositionsTable } from './FilteredPositionsTable'
import type { PositionRow, RawPosition } from '@/domains/portfolio/types/domain'
import { ConcentrationChart } from '@/domains/portfolio/components/portfolio-charts/ConcentrationChart'
import { CumulativeConcentrationChart } from '@/domains/portfolio/components/portfolio-charts/CumulativeConcentrationChart'
import type { FundHolding, HistoricalFundHolding } from '@/domains/portfolio/apis/queries/useFundHoldings'
import {
  ConcentrationModeToggle,
  type ConcentrationMode,
} from '@/domains/portfolio/components/portfolio-charts/ConcentrationModeToggle'
import { fmtFull } from '@/shared/format/money'
import { ConcentrationTrendSection } from './ConcentrationTrendSection'
import { useAllocationCharts } from '@/domains/portfolio/services/useAllocationCharts'
import { useDashboardAllocation } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocation'

interface AllocationChartsProps {
  positions: PositionRow[]
  rawPositions: RawPosition[]
  fundHoldings: FundHolding[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  rawData: RawIsinData
  dateFrom?: string
  dateTo?: string
}

export function AllocationCharts({ positions, rawPositions, fundHoldings, fundHoldingsHistory, accountFilters, accountTypeFilters, rawData, dateFrom, dateTo }: AllocationChartsProps) {
  const [concentrationMode, setConcentrationMode] = useState<ConcentrationMode>('held')
  const { allocationFilter: activeFilter, allocationView: view, positionsOpen } = useDashboardAllocation()
  const {
    baseClasse,
    baseCurrency,
    baseGeo,
    baseSecteur,
    concentration,
    cumulativeConcentration,
    hasApplicableValue,
    hasEvolution,
    hasSelectedValue,
    heldAssetConcentration,
    heldConcentrationHistory,
    latestClasse,
    latestCurrency,
    latestGeo,
    latestSecteur,
    lookThroughConcentration,
    lookThroughConcentrationHistory,
    tableRows,
    trendClasse,
    trendCurrency,
    trendGeo,
    trendSecteur,
  } = useAllocationCharts({
    positions,
    rawPositions,
    fundHoldings,
    fundHoldingsHistory,
    accountFilters,
    accountTypeFilters,
    activeFilter,
    concentrationMode,
    rawData,
    dateFrom,
    dateTo,
  })
  if (rawData.loading) return <p className="text-gray-400 text-sm">Loading breakdowns…</p>

  if (hasSelectedValue && !hasApplicableValue) {
    return <p className="text-sm text-gray-500">Diversification is not applicable to savings, checking and brokerage-cash accounts.</p>
  }

  if (view === 'current' && !baseGeo.length && !baseSecteur.length && !baseCurrency.length && !baseClasse.length) {
    return <p className="text-gray-500 text-sm">No allocation data available. Run the pipeline to generate the files.</p>
  }

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
                    effectiveDate={dateTo}
                    description={concentrationMode === 'held'
                      ? 'Share of the applicable portfolio held in the largest N positions.'
                      : `Share of the applicable portfolio identified in the largest N look-through exposures · ${concentration.coveragePct.toFixed(1)}% coverage.`}
                  />
                  <ConcentrationChart
                    data={concentration.holdings}
                    effectiveDate={dateTo}
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
              {latestGeo && <DonutCard title="Geography" point={latestGeo} dimension="geo" />}
              {latestClasse && <DonutCard title="Asset class" point={latestClasse} dimension="classe" />}
              {latestSecteur && <DonutCard title="Sector" point={latestSecteur} dimension="secteur" />}
              {latestCurrency && <DonutCard title="Currency (equities + fixed income)" point={latestCurrency} dimension="currency" />}
            </div>
          </section>
        </>
      )}

      {view === 'trend' && (
        <>
          <ConcentrationTrendSection
            heldPoints={heldConcentrationHistory}
            lookThroughPoints={lookThroughConcentrationHistory}
            lookThroughAvailable={fundHoldingsHistory.length > 0}
          />
          {hasEvolution ? <section>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-300">Portfolio breakdown trends</h3>
              <p className="mt-0.5 text-xs text-gray-600">Track how the mix changed by geography, asset class, sector and currency.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {trendGeo.length >= 2 && <EvoCard title="Geography" points={trendGeo} dimension="geo" />}
              {trendClasse.length >= 2 && <EvoCard title="Asset class" points={trendClasse} dimension="classe" />}
              {trendSecteur.length >= 2 && <EvoCard title="Sector" points={trendSecteur} dimension="secteur" />}
              {trendCurrency.length >= 2 && <EvoCard title="Currency" points={trendCurrency} dimension="currency" />}
            </div>
          </section> : <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">Not enough portfolio breakdown history.</div>}
        </>
      )}

      {/* ── Panneau positions ─────────────────────────────────────────────── */}
      {positionsOpen && activeFilter && tableRows.length > 0 && (
        <FilteredPositionsTable
          rows={tableRows}
        />
      )}

    </div>
  )
}

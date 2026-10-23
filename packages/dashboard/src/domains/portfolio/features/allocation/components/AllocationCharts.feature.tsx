import i18n from '@/i18n/i18n'
import { useState } from 'react'
import { useAtomValue } from 'jotai'
import type { RawIsinData } from '@/domains/portfolio/shared/apis/queries/useRawIsinData'
import { DonutCard } from './DonutCard.feature'
import { EvoCard } from './EvoCard.feature'
import { FilteredPositionsTable } from './FilteredPositionsTable.feature'
import type { PositionRow, RawPosition } from '@/domains/portfolio/shared/types/domain'
import { ConcentrationChart } from '@/domains/portfolio/features/allocation/features/concentration/components/ConcentrationChart.feature'
import { CumulativeConcentrationChart } from '@/domains/portfolio/features/allocation/features/concentration/components/CumulativeConcentrationChart.feature'
import type { FundHolding, HistoricalFundHolding } from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import {
  ConcentrationModeToggle,
  type ConcentrationMode,
} from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import { ConcentrationTrendSection } from '@/domains/portfolio/features/allocation/features/concentration/components/ConcentrationTrendSection.feature'
import { useAllocationCharts } from '@/domains/portfolio/features/allocation/services/useAllocationCharts'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
  dashboardAllocationViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import { useConcentrationDescriptions } from '@/domains/portfolio/features/allocation/features/concentration/services/useConcentrationDescriptions'

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
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const view = useAtomValue(dashboardAllocationViewAtom)
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
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
  const { cumulativeDescription, holdingsDescription } = useConcentrationDescriptions(concentration, concentrationMode)
  const hasConcentrationData = heldAssetConcentration.allHoldings.length > 0
    || lookThroughConcentration.allHoldings.length > 0
  const showFilteredPositions = positionsOpen && activeFilter != null && tableRows.length > 0
  if (rawData.loading) return <p className="text-gray-400 text-sm">{i18n.t('ui.allocationcharts.loadingBreakdowns')}</p>

  if (hasSelectedValue && !hasApplicableValue) {
    return <p className="text-sm text-gray-500">{i18n.t('ui.allocationcharts.diversificationIsNotApplicableToSavingsCheckingAndBrokerage')}</p>
  }

  if (view === 'current' && !baseGeo.length && !baseSecteur.length && !baseCurrency.length && !baseClasse.length) {
    return <p className="text-gray-500 text-sm">{i18n.t('ui.allocationcharts.noAllocationDataAvailableRunThePipelineToGenerate')}</p>
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {view === 'current' && (
        <>
          {hasConcentrationData && (
            <section>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300">{i18n.t('ui.allocationcharts.assetConcentration')}</h3>
                  <p className="mt-0.5 text-xs text-gray-600">{i18n.t('ui.allocationcharts.seeHowMuchOfThePortfolioIsConcentratedIn')}</p>
                </div>
                <ConcentrationModeToggle value={concentrationMode} onChange={setConcentrationMode} />
              </div>
              {concentration.allHoldings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <CumulativeConcentrationChart
                    data={cumulativeConcentration}
                    effectiveDate={dateTo}
                    description={cumulativeDescription}
                  />
                  <ConcentrationChart
                    data={concentration.holdings}
                    effectiveDate={dateTo}
                    topTenValue={concentration.topTenValue}
                    topTenPct={concentration.topTenPct}
                    description={holdingsDescription}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">

                  {i18n.t('ui.allocationcharts.noIdentifiedLookThroughExposureForTheCurrentSelection')}
                </div>
              )}
            </section>
          )}
          <section>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-300">{i18n.t('ui.allocationcharts.portfolioBreakdown')}</h3>
              <p className="mt-0.5 text-xs text-gray-600">{i18n.t('ui.allocationcharts.exploreTheCurrentMixByGeographyAssetClassSector')}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {latestGeo && <DonutCard title={i18n.t('ui.allocationcharts.geography')} point={latestGeo} dimension="geo" />}
              {latestClasse && <DonutCard title={i18n.t('ui.allocationcharts.assetClass')} point={latestClasse} dimension="classe" />}
              {latestSecteur && <DonutCard title={i18n.t('ui.allocationcharts.sector')} point={latestSecteur} dimension="secteur" />}
              {latestCurrency && <DonutCard title={i18n.t('ui.allocationcharts.currencyEquitiesFixedIncome')} point={latestCurrency} dimension="currency" />}
            </div>
          </section>
        </>
      )}

      {view === 'trend' && (
        <>
          <ConcentrationTrendSection
            heldPoints={heldConcentrationHistory}
            lookThroughPoints={lookThroughConcentrationHistory}
            // eslint-disable-next-line local/no-prop-drilling -- Availability is aggregate orchestration state owned by this parent feature.
            lookThroughAvailable={fundHoldingsHistory.length > 0}
          />
          {hasEvolution ? <section>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-300">{i18n.t('ui.allocationcharts.portfolioBreakdownTrends')}</h3>
              <p className="mt-0.5 text-xs text-gray-600">{i18n.t('ui.allocationcharts.trackHowTheMixChangedByGeographyAssetClass')}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {trendGeo.length >= 2 && <EvoCard title={i18n.t('ui.allocationcharts.geography')} points={trendGeo} dimension="geo" />}
              {trendClasse.length >= 2 && <EvoCard title={i18n.t('ui.allocationcharts.assetClass')} points={trendClasse} dimension="classe" />}
              {trendSecteur.length >= 2 && <EvoCard title={i18n.t('ui.allocationcharts.sector')} points={trendSecteur} dimension="secteur" />}
              {trendCurrency.length >= 2 && <EvoCard title={i18n.t('ui.allocationcharts.currency')} points={trendCurrency} dimension="currency" />}
            </div>
          </section> : <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">{i18n.t('ui.allocationcharts.notEnoughPortfolioBreakdownHistory')}</div>}
        </>
      )}

      {/* ── Panneau positions ─────────────────────────────────────────────── */}
      {showFilteredPositions && (
        <FilteredPositionsTable
          rows={tableRows}
        />
      )}

    </div>
  )
}

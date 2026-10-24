import { ConcentrationChart } from '@/domains/portfolio/features/allocation/features/concentration/components/ConcentrationChart.feature'
import { ConcentrationTrendSection } from '@/domains/portfolio/features/allocation/features/concentration/components/ConcentrationTrendSection.feature'
import { CumulativeConcentrationChart } from '@/domains/portfolio/features/allocation/features/concentration/components/CumulativeConcentrationChart.feature'
import { useConcentrationDescriptions } from '@/domains/portfolio/features/allocation/features/concentration/services/useConcentrationDescriptions'
import { useAllocationCharts } from '@/domains/portfolio/features/allocation/services/useAllocationCharts'
import {
  ConcentrationModeToggle,
  type ConcentrationMode,
} from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationViewAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type {
  FundHolding,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'
import i18n from '@/i18n/i18n'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { DonutCard } from './DonutCard.feature'
import { EvoCard } from './EvoCard.feature'
import { FilteredPositionsTable } from './FilteredPositionsTable.feature'

type AllocationChartsProps = {
  positions: PositionRow[]
  rawPositions: RawPosition[]
  fundHoldings: FundHolding[]
  fundHoldingsHistory: HistoricalFundHolding[]
  accountFilters: Set<string>
  accountTypeFilters: Set<string>
  rawData: RawIsinData
  dateFrom?: Date
  dateTo?: Date
}

export function AllocationCharts({
  positions,
  rawPositions,
  fundHoldings,
  fundHoldingsHistory,
  accountFilters,
  accountTypeFilters,
  rawData,
  dateFrom,
  dateTo,
}: AllocationChartsProps) {
  const [concentrationMode, setConcentrationMode] = useState<ConcentrationMode>('held')
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const view = useAtomValue(dashboardAllocationViewAtom)
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
  const { cumulativeDescription, holdingsDescription } = useConcentrationDescriptions(
    concentration,
    concentrationMode,
  )
  const hasConcentrationData =
    heldAssetConcentration.allHoldings.length > 0 || lookThroughConcentration.allHoldings.length > 0
  if (rawData.loading)
    return (
      <p className="text-content-muted text-sm">
        {i18n.t('ui.allocationcharts.loadingBreakdowns')}
      </p>
    )

  if (hasSelectedValue && !hasApplicableValue) {
    return (
      <p className="text-sm text-content-subtle">
        {i18n.t('ui.allocationcharts.diversificationIsNotApplicableToSavingsCheckingAndBrokerage')}
      </p>
    )
  }

  if (
    view === 'current' &&
    !baseGeo.length &&
    !baseSecteur.length &&
    !baseCurrency.length &&
    !baseClasse.length
  ) {
    return (
      <p className="text-content-subtle text-sm">
        {i18n.t('ui.allocationcharts.noAllocationDataAvailableRunThePipelineToGenerate')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {view === 'current' && (
        <>
          {hasConcentrationData && (
            <section>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-content-secondary">
                    {i18n.t('ui.allocationcharts.assetConcentration')}
                  </h3>
                  <p className="mt-0.5 text-xs text-content-subtle">
                    {i18n.t('ui.allocationcharts.seeHowMuchOfThePortfolioIsConcentratedIn')}
                  </p>
                </div>
                <ConcentrationModeToggle
                  value={concentrationMode}
                  onChange={setConcentrationMode}
                />
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
                <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-content-subtle">
                  {i18n.t(
                    'ui.allocationcharts.noIdentifiedLookThroughExposureForTheCurrentSelection',
                  )}
                </div>
              )}
            </section>
          )}
          <section>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-content-secondary">
                {i18n.t('ui.allocationcharts.portfolioBreakdown')}
              </h3>
              <p className="mt-0.5 text-xs text-content-subtle">
                {i18n.t('ui.allocationcharts.exploreTheCurrentMixByGeographyAssetClassSector')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {latestGeo && (
                <DonutCard
                  title={i18n.t('ui.allocationcharts.geography')}
                  point={latestGeo}
                  dimension="geo"
                />
              )}
              {latestClasse && (
                <DonutCard
                  title={i18n.t('ui.allocationcharts.assetClass')}
                  point={latestClasse}
                  dimension="classe"
                />
              )}
              {latestSecteur && (
                <DonutCard
                  title={i18n.t('ui.allocationcharts.sector')}
                  point={latestSecteur}
                  dimension="secteur"
                />
              )}
              {latestCurrency && (
                <DonutCard
                  title={i18n.t('ui.allocationcharts.currencyEquitiesFixedIncome')}
                  point={latestCurrency}
                  dimension="currency"
                />
              )}
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
          {hasEvolution ? (
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-medium text-content-secondary">
                  {i18n.t('ui.allocationcharts.portfolioBreakdownTrends')}
                </h3>
                <p className="mt-0.5 text-xs text-content-subtle">
                  {i18n.t('ui.allocationcharts.trackHowTheMixChangedByGeographyAssetClass')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {trendGeo.length >= 2 && (
                  <EvoCard
                    title={i18n.t('ui.allocationcharts.geography')}
                    points={trendGeo}
                    dimension="geo"
                  />
                )}
                {trendClasse.length >= 2 && (
                  <EvoCard
                    title={i18n.t('ui.allocationcharts.assetClass')}
                    points={trendClasse}
                    dimension="classe"
                  />
                )}
                {trendSecteur.length >= 2 && (
                  <EvoCard
                    title={i18n.t('ui.allocationcharts.sector')}
                    points={trendSecteur}
                    dimension="secteur"
                  />
                )}
                {trendCurrency.length >= 2 && (
                  <EvoCard
                    title={i18n.t('ui.allocationcharts.currency')}
                    points={trendCurrency}
                    dimension="currency"
                  />
                )}
              </div>
            </section>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-content-subtle">
              {i18n.t('ui.allocationcharts.notEnoughPortfolioBreakdownHistory')}
            </div>
          )}
        </>
      )}

      {/* ── Filtered positions panel ─────────────────────────────────────────────── */}
      <FilteredPositionsTable rows={tableRows} />
    </div>
  )
}

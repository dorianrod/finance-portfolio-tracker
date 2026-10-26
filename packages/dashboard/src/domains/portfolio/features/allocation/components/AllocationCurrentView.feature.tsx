import { ConcentrationChart } from '@/domains/portfolio/features/allocation/features/concentration/components/ConcentrationChart.feature'
import { CumulativeConcentrationChart } from '@/domains/portfolio/features/allocation/features/concentration/components/CumulativeConcentrationChart.feature'
import { useConcentrationDescriptions } from '@/domains/portfolio/features/allocation/features/concentration/services/useConcentrationDescriptions'
import { useAllocationCharts } from '@/domains/portfolio/features/allocation/services/useAllocationCharts'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { DonutCard } from './DonutCard.feature'

type Charts = ReturnType<typeof useAllocationCharts>
export function AllocationCurrentView({
  charts,
  concentrationMode,
  onModeChange,
  dateTo,
}: {
  charts: Charts
  concentrationMode: ConcentrationMode
  onModeChange: (mode: ConcentrationMode) => void
  dateTo?: Date
}) {
  const {
    heldAssetConcentration,
    lookThroughConcentration,
    concentration,
    cumulativeConcentration,
    latestClasse,
    latestCurrency,
    latestGeo,
    latestSecteur,
  } = charts
  const hasConcentrationData =
    heldAssetConcentration.allHoldings.length > 0 ||
    lookThroughConcentration.allHoldings.length > 0
  const { cumulativeDescription, holdingsDescription } =
    useConcentrationDescriptions(concentration, concentrationMode)
  return (
    <>
      {hasConcentrationData && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <Text as="h3" variant="label" tone="secondary">
                {i18n.t('ui.allocationcharts.assetConcentration')}
              </Text>
              <div className="mt-0.5">
                <Text as="p" variant="caption" tone="subtle">
                  {i18n.t(
                    'ui.allocationcharts.seeHowMuchOfThePortfolioIsConcentratedIn',
                  )}
                </Text>
              </div>
            </div>
            <ConcentrationModeToggle
              value={concentrationMode}
              onChange={onModeChange}
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
            <Surface variant="contentCard" tone="subtle" align="center">
              {i18n.t(
                'ui.allocationcharts.noIdentifiedLookThroughExposureForTheCurrentSelection',
              )}
            </Surface>
          )}
        </section>
      )}
      <section>
        <div className="mb-3">
          <Text as="h3" variant="label" tone="secondary">
            {i18n.t('ui.allocationcharts.portfolioBreakdown')}
          </Text>
          <div className="mt-0.5">
            <Text as="p" variant="caption" tone="subtle">
              {i18n.t(
                'ui.allocationcharts.exploreTheCurrentMixByGeographyAssetClassSector',
              )}
            </Text>
          </div>
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
  )
}

import { ConcentrationTrendSection } from '@/domains/portfolio/features/allocation/features/concentration/components/ConcentrationTrendSection.feature'
import { useAllocationCharts } from '@/domains/portfolio/features/allocation/services/useAllocationCharts'
import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { EvoCard } from './EvoCard.feature'

type Charts = ReturnType<typeof useAllocationCharts>
export function AllocationTrendView({
  charts,
  lookThroughAvailable,
}: {
  charts: Charts
  lookThroughAvailable: boolean
}) {
  const {
    hasEvolution,
    heldConcentrationHistory,
    lookThroughConcentrationHistory,
    trendClasse,
    trendCurrency,
    trendGeo,
    trendSecteur,
  } = charts
  return (
    <>
      <ConcentrationTrendSection
        heldPoints={heldConcentrationHistory}
        lookThroughPoints={lookThroughConcentrationHistory}

        lookThroughAvailable={lookThroughAvailable}
      />
      {hasEvolution ? (
        <section>
          <div className="mb-3">
            <Text as="h3" variant="label" tone="secondary">
              {i18n.t('ui.allocationcharts.portfolioBreakdownTrends')}
            </Text>
            <div className="mt-0.5">
              <Text as="p" variant="caption" tone="subtle">
                {i18n.t(
                  'ui.allocationcharts.trackHowTheMixChangedByGeographyAssetClass',
                )}
              </Text>
            </div>
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
        <Surface variant="contentCard" tone="subtle" align="center">
          {i18n.t('ui.allocationcharts.notEnoughPortfolioBreakdownHistory')}
        </Surface>
      )}
    </>
  )
}

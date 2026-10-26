import { ConcentrationTrendSection } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection.feature'
import { useDiversificationCharts } from '@/domains/portfolio/features/diversification/services/useDiversificationCharts'
import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { EvoCard } from './EvoCard.feature'

type Charts = ReturnType<typeof useDiversificationCharts>
export function DiversificationTrendView({
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
              {i18n.t('ui.diversificationcharts.portfolioBreakdownTrends')}
            </Text>
            <div className="mt-0.5">
              <Text as="p" variant="caption" tone="subtle">
                {i18n.t(
                  'ui.diversificationcharts.trackHowTheMixChangedByGeographyAssetClass',
                )}
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {trendGeo.length >= 2 && (
              <EvoCard
                title={i18n.t('ui.diversificationcharts.geography')}
                points={trendGeo}
                dimension="geo"
              />
            )}
            {trendClasse.length >= 2 && (
              <EvoCard
                title={i18n.t('ui.diversificationcharts.assetClass')}
                points={trendClasse}
                dimension="classe"
              />
            )}
            {trendSecteur.length >= 2 && (
              <EvoCard
                title={i18n.t('ui.diversificationcharts.sector')}
                points={trendSecteur}
                dimension="secteur"
              />
            )}
            {trendCurrency.length >= 2 && (
              <EvoCard
                title={i18n.t('ui.diversificationcharts.currency')}
                points={trendCurrency}
                dimension="currency"
              />
            )}
          </div>
        </section>
      ) : (
        <Surface variant="contentCard" tone="subtle" align="center">
          {i18n.t(
            'ui.diversificationcharts.notEnoughPortfolioBreakdownHistory',
          )}
        </Surface>
      )}
    </>
  )
}

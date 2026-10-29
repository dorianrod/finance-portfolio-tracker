import type { useAllocationCharts } from '@/domains/portfolio/features/diversification/features/allocation/helpers/mappers/useAllocationCharts'
import i18n from '@/i18n/i18n'
import { Text } from '@/shared/ui/Text.view'

import { DonutCard } from './DonutCard.feature'

export function AllocationCurrentView({
  charts,
}: {
  charts: ReturnType<typeof useAllocationCharts>
}) {
  const { latestClasse, latestCurrency, latestGeo, latestSecteur } = charts
  return (
    <>
      <section>
        <div className="mb-3">
          <Text as="h3" variant="label" tone="secondary">
            {i18n.t('ui.diversificationcharts.portfolioBreakdown')}
          </Text>
          <div className="mt-0.5">
            <Text as="p" variant="caption" tone="subtle">
              {i18n.t(
                'ui.diversificationcharts.exploreTheCurrentMixByGeographyAssetClassSector',
              )}
            </Text>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {latestGeo && (
            <DonutCard
              title={i18n.t('ui.diversificationcharts.geography')}
              point={latestGeo}
              dimension="geo"
            />
          )}
          {latestClasse && (
            <DonutCard
              title={i18n.t('ui.diversificationcharts.assetClass')}
              point={latestClasse}
              dimension="classe"
            />
          )}
          {latestSecteur && (
            <DonutCard
              title={i18n.t('ui.diversificationcharts.sector')}
              point={latestSecteur}
              dimension="secteur"
            />
          )}
          {latestCurrency && (
            <DonutCard
              title={i18n.t(
                'ui.diversificationcharts.currencyEquitiesFixedIncome',
              )}
              point={latestCurrency}
              dimension="currency"
            />
          )}
        </div>
      </section>
    </>
  )
}

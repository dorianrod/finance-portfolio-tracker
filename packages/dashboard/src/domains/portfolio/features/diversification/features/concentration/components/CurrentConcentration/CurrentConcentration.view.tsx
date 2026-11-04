import type { ReactNode } from 'react'

import { ConcentrationChart } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationChart.view'
import { CumulativeConcentrationChart } from '@/domains/portfolio/features/diversification/features/concentration/components/CumulativeConcentrationChart/CumulativeConcentrationChart.view'
import type { ConcentrationSummary } from '@/domains/portfolio/features/diversification/features/concentration/types/concentrationSummary.type'
import type { CumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/types/cumulativeConcentrationPoint.type'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function CurrentConcentrationView({
  visible,
  concentration,
  cumulativeConcentration,
  concentrationMode,
  onModeChange,
  cumulativeDescription,
  holdingsDescription,
  children,
}: {
  visible: boolean
  concentration: ConcentrationSummary
  cumulativeConcentration: CumulativeConcentrationPoint[]
  concentrationMode: ConcentrationMode
  onModeChange: (mode: ConcentrationMode) => void
  cumulativeDescription: string
  holdingsDescription: string
  children: ReactNode
}) {
  return (
    <>
      {visible && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <Text as="h3" variant="label" tone="secondary">
                {i18n.t('ui.diversificationcharts.assetConcentration')}
              </Text>
              <div className="mt-0.5">
                <Text as="p" variant="caption" tone="subtle">
                  {i18n.t(
                    'ui.diversificationcharts.seeHowMuchOfThePortfolioIsConcentratedIn',
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
                description={cumulativeDescription}
              >
                <InfoTooltip text={cumulativeDescription}>
                  <InfoTooltip.Footer>{children}</InfoTooltip.Footer>
                </InfoTooltip>
              </CumulativeConcentrationChart>
              <ConcentrationChart
                data={concentration.holdings}
                topTenValue={concentration.topTenValue}
                topTenPct={concentration.topTenPct}
                description={holdingsDescription}
              >
                <InfoTooltip text={holdingsDescription}>
                  <InfoTooltip.Footer>{children}</InfoTooltip.Footer>
                </InfoTooltip>
              </ConcentrationChart>
            </div>
          ) : (
            <Surface variant="contentCard" tone="subtle" align="center">
              {i18n.t(
                'ui.diversificationcharts.noIdentifiedLookThroughExposureForTheCurrentSelection',
              )}
            </Surface>
          )}
        </section>
      )}
    </>
  )
}

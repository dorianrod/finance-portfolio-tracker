import { useConcentrationTrendController } from '@/domains/portfolio/features/diversification/features/concentration/services/useConcentrationTrendController'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend/buildConcentrationTrend.types'
import i18n from '@/i18n/i18n'

import { ConcentrationTrendSectionView } from './ConcentrationTrendSection.view'

export function ConcentrationTrendSection({
  heldPoints,
  lookThroughPoints,
  lookThroughAvailable,
}: {
  heldPoints: HistoricalConcentrationPoint[]
  lookThroughPoints: HistoricalConcentrationPoint[]
  lookThroughAvailable: boolean
}) {
  const controller = useConcentrationTrendController(
    heldPoints,
    lookThroughPoints,
    lookThroughAvailable,
  )
  return (
    <ConcentrationTrendSectionView
      controller={controller}
      lookThroughAvailable={lookThroughAvailable}
    >
      <ConcentrationTrendSectionView.ThresholdTooltip>
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.concentrationtrendsection.minimumNumberOfTheLargestExposuresNeededToReach',
          )}
          scope={{ account: 'filterable', period: 'range' }}
        />
      </ConcentrationTrendSectionView.ThresholdTooltip>
      <ConcentrationTrendSectionView.HoldingsTooltip>
        <ScopedInfoTooltip
          text={i18n.t(
            'ui.concentrationtrendsection.rankedPortfolioExposuresAtEachMonthlySnapshotHoverUse',
          )}
          scope={{ account: 'filterable', period: 'range' }}
        />
      </ConcentrationTrendSectionView.HoldingsTooltip>
    </ConcentrationTrendSectionView>
  )
}

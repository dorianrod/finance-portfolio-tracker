import { ScopeProvider } from 'jotai-scope'

import { useConcentrationTrendController } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection/services/useConcentrationTrendController'
import { concentrationTrendDateAtom } from '@/domains/portfolio/features/diversification/features/concentration/stores/concentrationTrend/concentrationTrendDateAtom'
import { concentrationTrendHoveredIndexAtom } from '@/domains/portfolio/features/diversification/features/concentration/stores/concentrationTrend/concentrationTrendHoveredIndexAtom'
import { concentrationTrendModeAtom } from '@/domains/portfolio/features/diversification/features/concentration/stores/concentrationTrend/concentrationTrendModeAtom'
import { concentrationTrendPlayingAtom } from '@/domains/portfolio/features/diversification/features/concentration/stores/concentrationTrend/concentrationTrendPlayingAtom'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'
import i18n from '@/i18n/i18n'

import { ConcentrationTrendSectionView } from './ConcentrationTrendSection.view'

export function ConcentrationTrendSection(props: Props) {
  return (
    <ScopeProvider atoms={TREND_ATOMS}>
      <ConcentrationTrendContent {...props} />
    </ScopeProvider>
  )
}

type Props = {
  heldPoints: HistoricalConcentrationPoint[]
  lookThroughPoints: HistoricalConcentrationPoint[]
  lookThroughAvailable: boolean
}

const TREND_ATOMS = [
  concentrationTrendDateAtom,
  concentrationTrendHoveredIndexAtom,
  concentrationTrendModeAtom,
  concentrationTrendPlayingAtom,
]

function ConcentrationTrendContent({
  heldPoints,
  lookThroughPoints,
  lookThroughAvailable,
}: Props) {
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

import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionUnrealizedHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.unrealizedPLGross')}
      tooltip={i18n.t(
        'ui.positionstable.grossUnrealizedGainLossOnTheOpenPositionCalculation',
      )}
      col="unrealized_gain"
    />
  )
}

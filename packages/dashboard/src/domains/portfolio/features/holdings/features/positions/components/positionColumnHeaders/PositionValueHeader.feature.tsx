import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionValueHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.currentValue')}
      tooltip={i18n.t(
        'ui.positionstable.marketValueOfThePositionAtTheLastKnown',
      )}
      col="total_value"
    />
  )
}

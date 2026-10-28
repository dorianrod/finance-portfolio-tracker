import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionXirrHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.annualizedIrr')}
      tooltip={i18n.t(
        'ui.positionstable.annualizedInternalRateOfReturnXirrTheMainValue',
      )}
      col="xirr"
    />
  )
}

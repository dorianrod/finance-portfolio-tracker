import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionTotalReturnPctHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.totalReturn')}
      tooltip={i18n.t(
        'ui.positionstable.grossNonAnnualizedReturnAcrossAllSourcesCalculationCurrent',
      )}
      col="total_return_pct"
    />
  )
}

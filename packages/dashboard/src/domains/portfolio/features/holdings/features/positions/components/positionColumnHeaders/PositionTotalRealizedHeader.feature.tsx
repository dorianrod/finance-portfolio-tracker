import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionTotalRealizedHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.totalRealizedReturn')}
      tooltip={i18n.t(
        'ui.positionstable.cashActuallyCollectedRealizedGainsOnDisposalDividendsInterest',
      )}
      col="total_realized_return"
    />
  )
}

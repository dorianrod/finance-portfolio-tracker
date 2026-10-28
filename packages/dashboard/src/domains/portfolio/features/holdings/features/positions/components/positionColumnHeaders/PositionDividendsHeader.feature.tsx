import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionDividendsHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.dividendsInterest')}
      tooltip={i18n.t(
        'ui.positionstable.dividendsReceivedStocksEtfsAndInterestReceivedBondsCash',
      )}
      col="total_dividends"
    />
  )
}

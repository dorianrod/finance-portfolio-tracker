import { PositionSortHeader } from '@/domains/portfolio/features/holdings/features/positions/components/PositionSortHeader.feature'
import i18n from '@/i18n/i18n'

export function PositionRealizedHeader() {
  return (
    <PositionSortHeader
      label={i18n.t('ui.positionstable.realizedPLGross')}
      tooltip={i18n.t(
        'ui.positionstable.grossRealizedGainsLossesOnDisposalCalculationSaleProceeds',
      )}
      col="realized_gain"
    />
  )
}

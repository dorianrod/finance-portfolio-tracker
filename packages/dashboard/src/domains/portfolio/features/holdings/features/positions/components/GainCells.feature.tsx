import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Text } from '@/shared/ui/Text.view'

import { GainCell } from './GainCell.view'

export function UnrealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.unrealized_gain
  const net = position.unrealized_gain_net
  const taxRate = position.tax_rate
  if (gross == null) return <Text tone="subtle">—</Text>
  const taxAmount =
    net != null && taxRate != null && taxRate > 0 && gross > 0
      ? gross - net
      : null
  const taxDetails =
    taxRate != null && taxAmount != null && taxAmount > 0
      ? { amount: taxAmount, rate: taxRate }
      : null
  const isTaxFreeGain = taxRate === 0 && gross !== 0
  return (
    <Text variant="compact" className="flex flex-col">
      <GainCell value={gross} pct={position.unrealized_gain_pct} />
      {taxDetails && (
        <Text variant="tiny" tone="subtle" className="mt-0.5">
          {i18n.t('ui.gaincells.taxWithValues', {
            amount: formatMoney(-taxDetails.amount),
            percentage: formatPercentage(taxDetails.rate * 100, {
              decimals: 0,
            }),
          })}
        </Text>
      )}
      {isTaxFreeGain && (
        <Text variant="tiny" tone="subtle" className="mt-0.5">
          {i18n.t('ui.gaincells.net0Tax')}
        </Text>
      )}
    </Text>
  )
}

export function RealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.realized_gain
  const net = position.realized_gain_net
  const taxRate = position.tax_rate
  if (!gross) return <Text tone="subtle">—</Text>
  const taxAmount =
    net != null && taxRate != null && taxRate > 0 && gross > 0
      ? gross - net
      : null
  const taxDetails =
    taxRate != null && taxAmount != null && taxAmount > 0
      ? { amount: taxAmount, rate: taxRate }
      : null
  const isTaxFreeGain = taxRate === 0 && gross > 0
  return (
    <Text variant="compact" className="flex flex-col">
      <GainCell value={gross} />
      {taxDetails && (
        <Text variant="tiny" tone="subtle" className="mt-0.5">
          {i18n.t('ui.gaincells.taxWithValues', {
            amount: formatMoney(-taxDetails.amount),
            percentage: formatPercentage(taxDetails.rate * 100, {
              decimals: 0,
            }),
          })}
        </Text>
      )}
      {isTaxFreeGain && (
        <Text variant="tiny" tone="subtle" className="mt-0.5">
          {i18n.t('ui.gaincells.net0Tax')}
        </Text>
      )}
    </Text>
  )
}

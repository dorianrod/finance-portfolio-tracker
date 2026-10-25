import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

import { GainCell } from './GainCell.view'

export function UnrealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.unrealized_gain
  const net = position.unrealized_gain_net
  const taxRate = position.tax_rate
  if (gross == null) return <span className="text-content-subtle">—</span>
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
    <span className="flex flex-col leading-tight">
      <GainCell value={gross} pct={position.unrealized_gain_pct} />
      {taxDetails && (
        <span className="mt-0.5 text-[10px] text-content-subtle">
          {i18n.t('ui.gaincells.taxWithValues', {
            amount: formatMoney(-taxDetails.amount),
            percentage: formatPercentage(taxDetails.rate * 100, {
              decimals: 0,
            }),
          })}
        </span>
      )}
      {isTaxFreeGain && (
        <span className="mt-0.5 text-[10px] text-content-subtle">
          {i18n.t('ui.gaincells.net0Tax')}
        </span>
      )}
    </span>
  )
}

export function RealizedGainCell({ position }: { position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const gross = position.realized_gain
  const net = position.realized_gain_net
  const taxRate = position.tax_rate
  if (!gross) return <span className="text-content-subtle">—</span>
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
    <span className="flex flex-col leading-tight">
      <GainCell value={gross} />
      {taxDetails && (
        <span className="mt-0.5 text-[10px] text-content-subtle">
          {i18n.t('ui.gaincells.taxWithValues', {
            amount: formatMoney(-taxDetails.amount),
            percentage: formatPercentage(taxDetails.rate * 100, {
              decimals: 0,
            }),
          })}
        </span>
      )}
      {isTaxFreeGain && (
        <span className="mt-0.5 text-[10px] text-content-subtle">
          {i18n.t('ui.gaincells.net0Tax')}
        </span>
      )}
    </span>
  )
}

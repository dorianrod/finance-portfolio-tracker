import type { PositionRow } from '@/domains/portfolio/types/domain'
import { fmt } from '@/shared/format/money'
import { GainCell } from './GainCell.view'

export function UnrealizedGainCell({ position }: { position: PositionRow }) {
  const gross = position.unrealized_gain
  const net = position.unrealized_gain_net
  const taxRate = position.tax_rate
  if (gross == null) return <span className="text-gray-500">—</span>
  const taxAmount = net != null && taxRate != null && taxRate > 0 && gross > 0
    ? gross - net
    : null
  return (
    <span className="flex flex-col leading-tight">
      <GainCell value={gross} pct={position.unrealized_gain_pct} />
      {taxRate != null && taxAmount != null && taxAmount > 0 && (
        <span className="mt-0.5 text-[10px] text-gray-500">
          ~{fmt.format(-taxAmount)} tax ({(taxRate * 100).toFixed(0)}%)
        </span>
      )}
      {taxRate === 0 && gross !== 0 && (
        <span className="mt-0.5 text-[10px] text-gray-500">net (0% tax)</span>
      )}
    </span>
  )
}

export function RealizedGainCell({ position }: { position: PositionRow }) {
  const gross = position.realized_gain
  const net = position.realized_gain_net
  const taxRate = position.tax_rate
  if (!gross) return <span className="text-gray-500">—</span>
  const taxAmount = net != null && taxRate != null && taxRate > 0 && gross > 0
    ? gross - net
    : null
  return (
    <span className="flex flex-col leading-tight">
      <GainCell value={gross} />
      {taxRate != null && taxAmount != null && taxAmount > 0 && (
        <span className="mt-0.5 text-[10px] text-gray-500">
          ~{fmt.format(-taxAmount)} tax ({(taxRate * 100).toFixed(0)}%)
        </span>
      )}
      {taxRate === 0 && gross > 0 && (
        <span className="mt-0.5 text-[10px] text-gray-500">net (0% tax)</span>
      )}
    </span>
  )
}

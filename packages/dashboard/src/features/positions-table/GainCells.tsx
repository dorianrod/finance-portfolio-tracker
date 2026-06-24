import { fmt, fmtPct } from '@/shared/format/money'
import type { PositionRow } from '@/types/domain'
import { gainClass } from './positionsTable.logic'

export function GainCell({ value, pct }: { value: number | null; pct?: number | null }) {
  if (value == null) return <span className="text-gray-500">—</span>
  return (
    <span className={gainClass(value)}>
      {fmt.format(value)}
      {pct != null && <span className="ml-1 text-xs opacity-80">{fmtPct(pct, 2)}</span>}
    </span>
  )
}

export function UnrealizedGainCell({ r }: { r: PositionRow }) {
  const gross = r.unrealized_gain
  const net = r.unrealized_gain_net
  const taxRate = r.tax_rate
  if (gross == null) return <span className="text-gray-500">—</span>
  const taxAmount = (net != null && taxRate != null && taxRate > 0 && gross > 0)
    ? gross - net : null
  return (
    <span className="flex flex-col leading-tight">
      <GainCell value={gross} pct={r.unrealized_gain_pct} />
      {taxAmount != null && taxAmount > 0 && (
        <span className="text-[10px] text-gray-500 mt-0.5">
          ~{fmt.format(-taxAmount)} tax ({(taxRate! * 100).toFixed(0)}%)
        </span>
      )}
      {taxRate === 0 && gross !== 0 && (
        <span className="text-[10px] text-gray-500 mt-0.5">net (0% tax)</span>
      )}
    </span>
  )
}

export function RealizedGainCell({ r }: { r: PositionRow }) {
  const gross = r.realized_gain
  const net = r.realized_gain_net
  const taxRate = r.tax_rate
  if (!gross) return <span className="text-gray-500">—</span>
  const taxAmount = (net != null && taxRate != null && taxRate > 0 && gross > 0)
    ? gross - net : null
  return (
    <span className="flex flex-col leading-tight">
      <GainCell value={gross} />
      {taxAmount != null && taxAmount > 0 && (
        <span className="text-[10px] text-gray-500 mt-0.5">
          ~{fmt.format(-taxAmount)} tax ({(taxRate! * 100).toFixed(0)}%)
        </span>
      )}
      {taxRate === 0 && gross > 0 && (
        <span className="text-[10px] text-gray-500 mt-0.5">net (0% tax)</span>
      )}
    </span>
  )
}

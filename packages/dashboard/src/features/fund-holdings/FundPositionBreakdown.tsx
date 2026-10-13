import type { FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { fmtFull } from '@/shared/format/money'
import { FundQualityBadge } from './FundQualityBadge'
import { holdingsForPosition, statusForPosition } from './fundHoldings.logic'

export function FundPositionBreakdown({ position, holdings, statuses, onOpenComplete }: {
  position: PositionRow
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  onOpenComplete?: () => void
}) {
  const rows = holdingsForPosition(position, holdings)
  const status = statusForPosition(position, statuses)
  if (!status) return null
  const positionValue = position.total_value ?? 0
  return (
    <div className="m-2 rounded-lg border border-gray-700 bg-gray-950/70 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FundQualityBadge status={status} />
        <span className="text-xs text-gray-500">{status.sourceName}{status.proxyName ? ` · exact proxy ${status.proxyName}` : ''}</span>
        <span className="text-xs text-gray-600">Holdings {status.holdingsDate || 'unknown'} · {status.holdingCount.toLocaleString()} rows</span>
        {onOpenComplete && <button type="button" onClick={onOpenComplete} className="ml-auto text-xs font-medium text-blue-400 hover:text-blue-300">Open all identified exposure →</button>}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
        {rows.slice().sort((a, b) => b.weight - a.weight).slice(0, 8).map((holding) => (
          <div key={`${holding.holdingId}-${holding.holdingName}`} className="flex items-baseline gap-3 border-b border-gray-900 py-1.5 text-xs">
            <span className="min-w-0 flex-1 truncate text-gray-300" title={holding.holdingName}>{holding.holdingName}</span>
            <span className="tabular-nums text-gray-500">{(holding.weight * 100).toFixed(2)}%</span>
            <span className="w-24 text-right tabular-nums text-gray-400">{fmtFull(positionValue * holding.weight)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span>{status.explainedPct.toFixed(1)}% explained ({fmtFull(status.explainedValue)})</span>
        <span>{status.residualPct.toFixed(1)}% undisclosed ({fmtFull(status.residualValue)})</span>
        {status.issues && <span className="text-amber-300">{status.issues}</span>}
      </div>
    </div>
  )
}

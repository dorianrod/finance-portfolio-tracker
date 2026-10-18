import { createPortal } from 'react-dom'
import type { FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { computePopoverPos } from '@/features/allocation-charts/allocationCharts.logic'
import { fmtFull } from '@/shared/format/money'
import { holdingsForPosition } from './fundHoldings.logic'

export interface FundPositionPopoverTarget {
  position: PositionRow
  status: FundHoldingStatus
  buttonRect: DOMRect
}

export function FundPositionPopover({
  target,
  holdings,
  onOpenComplete,
  onMouseEnter,
  onMouseLeave,
}: {
  target: FundPositionPopoverTarget
  holdings: FundHolding[]
  onOpenComplete?: (fundName: string) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const { position, status } = target
  const rows = holdingsForPosition(position, holdings)
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
  const positionValue = position.total_value ?? 0
  const width = Math.min(560, window.innerWidth - 20)
  const estimatedHeight = Math.min(430, window.innerHeight - 20)
  const { top, left } = computePopoverPos(target.buttonRect, width, estimatedHeight)

  return createPortal(
    <div
      style={{ position: 'fixed', top, left, width, maxHeight: 'calc(100vh - 20px)', zIndex: 9999 }}
      className="overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{position.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-gray-600">{position.isin || position.ticker}</p>
        </div>
        {onOpenComplete && (
          <button type="button" onClick={() => onOpenComplete(position.name)} className="shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300">
            Open all →
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 border-b border-gray-800 pb-3 text-xs text-gray-500">
        <span>{status.sourceName}{status.proxyName ? ` · exact proxy ${status.proxyName}` : ''}</span>
        <span>Holdings {status.holdingsDate || 'unknown'} · {status.holdingCount.toLocaleString()} rows</span>
      </div>

      {rows.length > 0 ? (
        <div>
          {rows.map((holding) => (
            <div key={`${holding.holdingId}-${holding.holdingName}`} className="grid grid-cols-[minmax(0,1fr)_4rem_6rem] items-baseline gap-3 border-b border-gray-800/70 py-1.5 text-xs">
              <span className="truncate text-gray-300" title={holding.holdingName}>{holding.holdingName}</span>
              <span className="text-right tabular-nums text-gray-500">{(holding.weight * 100).toFixed(2)}%</span>
              <span className="text-right tabular-nums text-gray-400">{fmtFull(positionValue * holding.weight)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-5 text-center text-xs text-gray-500">No underlying holdings available.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span>{status.explainedPct.toFixed(1)}% explained ({fmtFull(status.explainedValue)})</span>
        <span>{status.residualPct.toFixed(1)}% undisclosed ({fmtFull(status.residualValue)})</span>
        {status.issues && <span className="basis-full text-amber-300">{status.issues}</span>}
      </div>
    </div>,
    document.body,
  )
}

import { createPortal } from 'react-dom'
import type { AllocationPoint } from '@/hooks/useAllocationData'
import type { IsinAllocation } from '@/hooks/useAllocationByIsin'
import { computePopoverPos } from './allocationCharts.logic'
import { MiniDonut } from './MiniDonut'

export interface AllocationHoverTarget {
  isin: string
  name: string
  buttonRect: DOMRect
  allocation: IsinAllocation
}

export function HoverAllocationPopover({
  target,
  onMouseEnter,
  onMouseLeave,
}: {
  target: AllocationHoverTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const { allocation } = target
  const charts = [
    { title: 'Geography', point: allocation.geo },
    { title: 'Asset class', point: allocation.classe },
    { title: 'Sector', point: allocation.secteur },
    { title: 'Currency', point: allocation.currency },
  ].filter((c): c is { title: string; point: AllocationPoint } => c.point != null && c.point.categories.length > 0)

  if (!charts.length) return null

  const cols = charts.length >= 2 ? 2 : 1
  const W = cols === 2 ? 490 : 250
  const H = charts.length > 2 ? 430 : 230
  const { top, left } = computePopoverPos(target.buttonRect, W, H)

  return createPortal(
    <div
      style={{ position: 'fixed', top, left, width: W, zIndex: 9999, pointerEvents: 'auto' }}
      className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <p className="text-sm font-semibold text-white mb-3 truncate">{target.name}</p>
      <div className={`grid gap-3 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {charts.map((c) => (
          <MiniDonut key={c.title} title={c.title} point={c.point} />
        ))}
      </div>
    </div>,
    document.body,
  )
}

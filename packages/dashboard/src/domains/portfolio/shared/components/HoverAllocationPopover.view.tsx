import { createPortal } from 'react-dom'

import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { IsinAllocation } from '@/domains/portfolio/shared/types/isinAllocation.type'
import i18n from '@/i18n/i18n'
import { computePopoverPosition } from '@/shared/ui/helpers/presenters/computePopoverPosition'

import { MiniDonut } from './MiniDonut.view'

export type AllocationHoverTarget = {
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
    {
      title: i18n.t('ui.hoverallocationpopover.geography'),
      point: allocation.geo,
    },
    {
      title: i18n.t('ui.hoverallocationpopover.assetClass'),
      point: allocation.classe,
    },
    {
      title: i18n.t('ui.hoverallocationpopover.sector'),
      point: allocation.secteur,
    },
    {
      title: i18n.t('ui.hoverallocationpopover.currency'),
      point: allocation.currency,
    },
  ].filter(
    (c): c is { title: string; point: AllocationPoint } =>
      c.point != null && c.point.categories.length > 0,
  )

  if (!charts.length) return null

  const cols = charts.length >= 2 ? 2 : 1
  const W = cols === 2 ? 490 : 250
  const H = charts.length > 2 ? 430 : 230
  const popoverPosition = computePopoverPosition(target.buttonRect, W, H, {
    width: window.innerWidth,
    height: window.innerHeight,
  })

  return createPortal(
    <div
      style={{
        position: 'fixed',
        ...popoverPosition,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      className="overflow-y-auto bg-surface border border-border-strong rounded-xl p-3 shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <p className="text-sm font-semibold text-content mb-3 truncate">
        {target.name}
      </p>
      <div
        className={`grid gap-3 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {charts.map((c) => (
          <MiniDonut key={c.title} title={c.title} point={c.point} />
        ))}
      </div>
    </div>,
    document.body,
  )
}

import type { AllocationHoverTarget } from '@/domains/portfolio/shared/types/allocationHoverTarget.type'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import i18n from '@/i18n/i18n'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

import { MiniDonut } from './MiniDonut.view'

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

  return (
    <Preview.Content
      anchor={target.buttonRect}
      label={target.name}
      style={{ width: `min(${W}px, calc(100vw - 20px))` }}
      variant="floatingPanel"
      className="overflow-y-auto p-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Text
        as="p"
        variant="bodyStrong"
        tone="default"
        truncate
        className="mb-3"
      >
        {target.name}
      </Text>
      <div
        className={`grid gap-3 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {charts.map((c) => (
          <MiniDonut key={c.title} title={c.title} point={c.point} />
        ))}
      </div>
    </Preview.Content>
  )
}

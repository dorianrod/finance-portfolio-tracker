import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import { SegmentedControlItem } from '@/shared/ui/SegmentedControl.view'

export function HoldingsViewTab({
  activeView,
  onSelect,
  view,
}: {
  activeView: HoldingsView
  onSelect: (view: HoldingsView) => void
  view: { id: HoldingsView; label: string }
}) {
  const active = activeView === view.id
  return (
    <SegmentedControlItem
      id={`holdings-${view.id}-tab`}
      active={active}
      size="large"
      aria-current={active ? 'page' : undefined}
      aria-controls={`holdings-${view.id}-panel`}
      onClick={() => onSelect(view.id)}
    >
      {view.label}
    </SegmentedControlItem>
  )
}

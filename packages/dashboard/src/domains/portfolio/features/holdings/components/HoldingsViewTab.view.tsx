import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import { ViewNavigation } from '@/shared/ui/ViewNavigation.view'

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
    <ViewNavigation.Item
      value={view.id}
      active={active}
      size="large"
      onClick={() => onSelect(view.id)}
    >
      {view.label}
    </ViewNavigation.Item>
  )
}

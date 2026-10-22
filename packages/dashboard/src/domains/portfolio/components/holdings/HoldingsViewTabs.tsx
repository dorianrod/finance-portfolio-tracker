import { useAtomValue } from 'jotai'
import { useDashboardNavigation } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardNavigation'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardNavigation.atoms'
import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/SegmentedControl'

export type HoldingsView = 'positions' | 'underlying'

const HOLDINGS_VIEWS: Array<{ id: HoldingsView; label: string }> = [
  { id: 'positions', label: 'Positions' },
  { id: 'underlying', label: 'Underlying exposure' },
]

export function HoldingsViewTabs() {
  const value = useAtomValue(dashboardHoldingsViewAtom)
  const { setHoldingsView } = useDashboardNavigation()

  return (
    <SegmentedControl label="Holdings views" className="mb-5 w-full overflow-x-auto sm:w-fit">
      {HOLDINGS_VIEWS.map((view) => {
        const active = value === view.id
        return (
          <SegmentedControlItem
            key={view.id}
            id={`holdings-${view.id}-tab`}
            active={active}
            size="large"
            aria-current={active ? 'page' : undefined}
            aria-controls={`holdings-${view.id}-panel`}
            onClick={() => setHoldingsView(view.id)}
          >
            {view.label}
          </SegmentedControlItem>
        )
      })}
    </SegmentedControl>
  )
}

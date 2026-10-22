import { useAtomValue } from 'jotai'
import { useDashboardAllocationView } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationView'
import { dashboardAllocationViewAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'
import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/SegmentedControl'

export type AllocationView = 'current' | 'trend'

export function AllocationViewToggle() {
  const value = useAtomValue(dashboardAllocationViewAtom)
  const { setAllocationView } = useDashboardAllocationView()

  return (
    <SegmentedControl label="Diversification view">
      <SegmentedControlItem
        active={value === 'current'}
        onClick={() => setAllocationView('current')}
      >
        Current
      </SegmentedControlItem>
      <SegmentedControlItem
        active={value === 'trend'}
        onClick={() => setAllocationView('trend')}
      >
        Trend
      </SegmentedControlItem>
    </SegmentedControl>
  )
}

import i18n from '@/i18n/i18n'
import { useAtomValue } from 'jotai'
import { useDashboardAllocationView } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationView'
import { dashboardAllocationViewAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'
import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/SegmentedControl.view'

export type AllocationView = 'current' | 'trend'

export function AllocationViewToggle() {
  const value = useAtomValue(dashboardAllocationViewAtom)
  const { setAllocationView } = useDashboardAllocationView()

  return (
    <SegmentedControl label={i18n.t('ui.allocationviewtoggle.diversificationView')}>
      <SegmentedControlItem
        active={value === 'current'}
        onClick={() => setAllocationView('current')}
      >

        {i18n.t('ui.allocationviewtoggle.current')}
      </SegmentedControlItem>
      <SegmentedControlItem
        active={value === 'trend'}
        onClick={() => setAllocationView('trend')}
      >

        {i18n.t('ui.allocationviewtoggle.trend')}
      </SegmentedControlItem>
    </SegmentedControl>
  )
}

import i18n from '@/i18n/i18n'
import { useAtomValue } from 'jotai'
import { useDashboardAllocationView } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationView'
import { dashboardAllocationViewAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/SegmentedControl.view'

export type { AllocationView } from '@/domains/portfolio/shared/types/dashboardView.type'

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

import { useAtomValue } from 'jotai'

import { useDashboardDiversificationView } from '@/domains/portfolio/shared/services/actions/useDashboardDiversificationView'
import { dashboardDiversificationViewAtom } from '@/domains/portfolio/shared/stores/dashboardDiversification.atoms'
import i18n from '@/i18n/i18n'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/shared/ui/SegmentedControl.view'

export type { DiversificationView } from '@/domains/portfolio/shared/types/dashboardView.type'

export function DiversificationViewToggle() {
  const value = useAtomValue(dashboardDiversificationViewAtom)
  const { setDiversificationView } = useDashboardDiversificationView()

  return (
    <SegmentedControl
      label={i18n.t('ui.diversificationviewtoggle.diversificationView')}
    >
      <SegmentedControlItem
        active={value === 'current'}
        onClick={() => setDiversificationView('current')}
      >
        {i18n.t('ui.diversificationviewtoggle.current')}
      </SegmentedControlItem>
      <SegmentedControlItem
        active={value === 'trend'}
        onClick={() => setDiversificationView('trend')}
      >
        {i18n.t('ui.diversificationviewtoggle.trend')}
      </SegmentedControlItem>
    </SegmentedControl>
  )
}

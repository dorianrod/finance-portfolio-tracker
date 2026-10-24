import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import i18n from '@/i18n/i18n'
import { SegmentedControl } from '@/shared/ui/SegmentedControl.view'
import { useAtomValue } from 'jotai'
import { HoldingsViewTab } from './HoldingsViewTab.view'

export type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'

const HOLDINGS_VIEWS: Array<{ id: HoldingsView; label: string }> = [
  { id: 'positions', label: i18n.t('ui.holdingsviewtabs.positions') },
  { id: 'underlying', label: i18n.t('ui.holdingsviewtabs.underlyingExposure') },
]

export function HoldingsViewTabs() {
  const value = useAtomValue(dashboardHoldingsViewAtom)
  const { setHoldingsView } = useDashboardNavigation()

  return (
    <SegmentedControl
      label={i18n.t('ui.holdingsviewtabs.holdingsViews')}
      className="mb-5 w-full overflow-x-auto sm:w-fit"
    >
      {HOLDINGS_VIEWS.map((view) => (
        <HoldingsViewTab key={view.id} activeView={value} onSelect={setHoldingsView} view={view} />
      ))}
    </SegmentedControl>
  )
}

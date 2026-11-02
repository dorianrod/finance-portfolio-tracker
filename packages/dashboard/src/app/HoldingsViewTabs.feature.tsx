import { useAtom } from 'jotai'

import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import i18n from '@/i18n/i18n'
import { SegmentedControl } from '@/shared/ui/segmentedControl/SegmentedControl.view'

import { HoldingsViewTab } from './HoldingsViewTab.view'

export function HoldingsViewTabs() {
  const [value, setHoldingsView] = useAtom(dashboardHoldingsViewAtom)

  return (
    <div className="mb-5 w-full overflow-x-auto sm:w-fit">
      <SegmentedControl label={i18n.t('ui.holdingsviewtabs.holdingsViews')}>
        {HOLDINGS_VIEWS.map((view) => (
          <HoldingsViewTab
            key={view.id}
            activeView={value}
            onSelect={setHoldingsView}
            view={view}
          />
        ))}
      </SegmentedControl>
    </div>
  )
}

export type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'

const HOLDINGS_VIEWS: Array<{ id: HoldingsView; label: string }> = [
  {
    id: 'positions',
    get label() {
      return i18n.t('ui.holdingsviewtabs.positions')
    },
  },
  {
    id: 'underlying',
    get label() {
      return i18n.t('ui.holdingsviewtabs.underlyingExposure')
    },
  },
]

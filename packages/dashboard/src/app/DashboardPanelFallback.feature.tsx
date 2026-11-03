import { useAtomValue } from 'jotai'

import { DashboardPanelSkeleton } from '@/app/skeletons/DashboardPanelSkeleton.view'
import { dashboardDiversificationViewAtom } from '@/domains/portfolio/features/diversification/shared/stores/dashboardDiversification.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import i18n from '@/i18n/i18n'
import { Skeleton } from '@/shared/ui/Skeleton.view'

export function DashboardPanelFallback() {
  const tab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const diversificationView = useAtomValue(dashboardDiversificationViewAtom)

  return (
    <Skeleton label={i18n.t('ui.app.loadingAnalysis')}>
      <DashboardPanelSkeleton
        tab={tab}
        holdingsView={holdingsView}
        diversificationView={diversificationView}
      />
    </Skeleton>
  )
}

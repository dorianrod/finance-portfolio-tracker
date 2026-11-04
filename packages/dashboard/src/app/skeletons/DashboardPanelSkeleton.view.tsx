import type { DiversificationView } from '@/domains/portfolio/features/diversification/shared/types/diversificationView.type'
import type { AnalysisTab } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardNavigation.types'
import type { HoldingsView } from '@/domains/portfolio/shared/types/dashboardView.type'
import { Layout } from '@/shared/ui/layout/Layout.view'

import { DiversificationSkeleton } from './DiversificationSkeleton.view'
import { HoldingsSkeleton } from './HoldingsSkeleton.view'
import { OverviewSkeleton } from './OverviewSkeleton.view'
import { PerformanceSkeleton } from './PerformanceSkeleton.view'
import { QualitySkeleton } from './QualitySkeleton.view'
import { WealthSkeleton } from './WealthSkeleton.view'

export function DashboardPanelSkeleton({
  tab,
  holdingsView,
  diversificationView,
}: {
  tab: AnalysisTab
  holdingsView: HoldingsView
  diversificationView: DiversificationView
}) {
  return (
    <Layout spaceAfter="spacious">
      <PanelSkeleton
        tab={tab}
        holdingsView={holdingsView}
        diversificationView={diversificationView}
      />
    </Layout>
  )
}

function PanelSkeleton({
  tab,
  holdingsView,
  diversificationView,
}: {
  tab: AnalysisTab
  holdingsView: HoldingsView
  diversificationView: DiversificationView
}) {
  switch (tab) {
    case 'overview':
      return <OverviewSkeleton />
    case 'wealth':
      return <WealthSkeleton />
    case 'performance':
      return <PerformanceSkeleton />
    case 'diversification':
      return <DiversificationSkeleton view={diversificationView} />
    case 'holdings':
      return <HoldingsSkeleton view={holdingsView} />
    case 'quality':
      return <QualitySkeleton />
  }
  const exhaustiveTab: never = tab
  return exhaustiveTab
}

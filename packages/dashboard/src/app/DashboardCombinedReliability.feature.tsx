import { useAtomValue } from 'jotai'

import { CombinedAnalysisReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CombinedAnalysisReliabilityKpi.feature'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import { Layout } from '@/shared/ui/layout/Layout.view'

import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardCombinedReliability({
  dashboard,
}: {
  dashboard: DashboardViewModel
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  if (activeTab !== 'overview' && activeTab !== 'diversification') return null
  return (
    <Layout spaceBefore="default">
      <CombinedAnalysisReliabilityKpi
        summary={dashboard.qualitySummary}
        allocationLoading={dashboard.rawAllocationData.loading}
        pipelineErrorsLoading={dashboard.pipelineErrorsLoading}
        variant={activeTab === 'overview' ? 'portfolio' : 'diversification'}
      />
    </Layout>
  )
}

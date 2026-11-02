import { useAtomValue } from 'jotai'

import { CombinedAnalysisReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CombinedAnalysisReliabilityKpi.feature'
import { useQualityAssessmentModel } from '@/domains/portfolio/features/data-quality/features/assessment/services/useQualityAssessmentModel'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { Layout } from '@/shared/ui/layout/Layout.view'

export function DashboardCombinedReliability() {
  const dashboard = useQualityAssessmentModel()
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

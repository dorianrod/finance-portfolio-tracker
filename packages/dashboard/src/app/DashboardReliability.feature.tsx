import { useAtomValue } from 'jotai'

import { AnalysisReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/AnalysisReliabilityKpi.feature'
import { CombinedAnalysisReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CombinedAnalysisReliabilityKpi.feature'
import { PipelineReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/PipelineReliabilityKpi.feature'
import { useQualityAssessmentModel } from '@/domains/portfolio/features/data-quality/features/assessment/services/useQualityAssessmentModel'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'

/*
 * @architecture-decision reliability-single-model-consumer
 * @rules ui-vercel-responsive-rendering, arch-component-roles
 * @choice Select every banner presentation from this persistent quality-model consumer.
 * @reason A conditional combined-banner consumer recreated position memos on return to Overview or Diversification despite unchanged financial inputs.
 * @alternative Passing a dashboard-wide model through another shell feature would preserve a forwarding layer without an independent acquisition responsibility.
 * @revisit A banner acquires an independent data lifecycle or financial scope.
 */
export function DashboardReliability() {
  const dashboard = useQualityAssessmentModel()
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const { pipelineErrorsLoading, qualitySummary } = dashboard
  const {
    identifiedFundValue,
    scopedPipelineErrorCount,
    scopedPipelineWarningCount,
    underlyingMetricTone,
    underlyingReliabilityPct,
  } = qualitySummary
  if (activeTab === 'overview' || activeTab === 'diversification') {
    return (
      <Layout spaceBefore="default">
        <CombinedAnalysisReliabilityKpi
          summary={qualitySummary}
          allocationLoading={dashboard.rawAllocationData.loading}
          pipelineErrorsLoading={pipelineErrorsLoading}
          variant={activeTab === 'overview' ? 'portfolio' : 'diversification'}
        />
      </Layout>
    )
  }
  if (activeTab === 'holdings' && holdingsView === 'underlying') {
    return (
      <Layout spaceBefore="default">
        <AnalysisReliabilityKpi
          percentage={underlyingReliabilityPct}
          amount={identifiedFundValue}
          metricLabel={i18n.t('ui.app.underlyingAssets')}
          tone={underlyingMetricTone}
          tooltip={i18n.t('ui.app.reliabilityOfTheLookThroughDataUsedByThe')}
          qualityTheme="lookthrough"
          scope={{ account: 'filterable', period: 'latest' }}
        />
      </Layout>
    )
  }
  if (activeTab === 'quality') return null
  return (
    <Layout spaceBefore="default">
      <PipelineReliabilityKpi
        errorCount={scopedPipelineErrorCount}
        warningCount={scopedPipelineWarningCount}
        loading={pipelineErrorsLoading}
        scope={{ account: 'filterable', period: 'range' }}
      />
    </Layout>
  )
}

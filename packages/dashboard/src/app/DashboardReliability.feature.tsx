import { useAtomValue } from 'jotai'

import { AnalysisReliabilityKpi } from '@/domains/portfolio/shared/components/quality/analysisReliabilityKpi/AnalysisReliabilityKpi.feature'
import { PipelineReliabilityKpi } from '@/domains/portfolio/shared/components/quality/analysisReliabilityKpi/PipelineReliabilityKpi.feature'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsViewAtom'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'

import { DashboardCombinedReliability } from './DashboardCombinedReliability.feature'
import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardReliability({
  dashboard,
}: {
  dashboard: DashboardViewModel
}) {
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
    return <DashboardCombinedReliability dashboard={dashboard} />
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

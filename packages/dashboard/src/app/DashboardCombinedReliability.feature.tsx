import { useAtomValue } from 'jotai'

import { CombinedAnalysisReliabilityKpi } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/CombinedAnalysisReliabilityKpi.feature'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTabAtom'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'

import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardCombinedReliability({
  dashboard,
}: {
  dashboard: DashboardViewModel
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const { qualitySummary } = dashboard
  const {
    reliabilityMetrics,
    portfolioStatusMetric,
    diversificationQualityTheme,
    diversificationReliabilityTone,
    overviewQualityTheme,
    overviewReliabilityTone,
  } = qualitySummary
  return (
    <>
      {activeTab === 'overview' && (
        <Layout spaceBefore="default">
          <CombinedAnalysisReliabilityKpi
            statusMetric={portfolioStatusMetric}
            metrics={reliabilityMetrics}
            tone={overviewReliabilityTone}
            tooltip={i18n.t(
              'ui.app.aggregateReliabilityForPortfolioDataDiversificationMappingAndUnderlying',
            )}
            qualityTheme={overviewQualityTheme}
            scope={{ account: 'filterable', period: 'mixed' }}
          />
        </Layout>
      )}
      {activeTab === 'diversification' && (
        <Layout spaceBefore="default">
          <CombinedAnalysisReliabilityKpi
            metrics={reliabilityMetrics}
            tone={diversificationReliabilityTone}
            tooltip={i18n.t(
              'ui.app.aggregateReliabilityForDiversificationMappingAndUnderlyingAssetsLook',
            )}
            qualityTheme={diversificationQualityTheme}
            scope={{
              account: 'filterable',
              period: 'latest',
            }}
          />
        </Layout>
      )}
    </>
  )
}

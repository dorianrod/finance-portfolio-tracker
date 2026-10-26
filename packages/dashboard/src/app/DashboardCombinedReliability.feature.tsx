import { useAtomValue } from 'jotai'

import { CombinedAnalysisReliabilityKpi } from '@/domains/portfolio/shared/components/quality/AnalysisReliabilityKpi.feature'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation.atoms'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/Layout.view'

import type { DashboardViewModel } from './types/dashboardViewModel.type'

export function DashboardCombinedReliability({
  dashboard,
}: {
  dashboard: DashboardViewModel
}) {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const { rawAllocationData, scopedFundQuality, qualitySummary } = dashboard
  const {
    classificationMappedValue,
    classificationMetricTone,
    classificationReliabilityPct,
    diversificationQualityTheme,
    diversificationReliabilityTone,
    identifiedFundValue,
    overviewQualityTheme,
    overviewReliabilityTone,
    portfolioDataStatus,
    portfolioDataTone,
    underlyingMetricTone,
    underlyingReliabilityPct,
  } = qualitySummary
  return (
    <>
      {activeTab === 'overview' && (
        <Layout spaceBefore="default">
          <CombinedAnalysisReliabilityKpi
            statusMetric={{
              value: portfolioDataStatus,
              metricLabel: i18n.t('ui.app.portfolioData'),
              tone: portfolioDataTone,
            }}
            metrics={[
              {
                percentage: rawAllocationData.loading
                  ? null
                  : classificationReliabilityPct,
                amount: classificationMappedValue,
                metricLabel: i18n.t('ui.app.diversification'),
                tone: classificationMetricTone,
              },
              {
                percentage: scopedFundQuality.report
                  ? underlyingReliabilityPct
                  : null,
                amount: identifiedFundValue,
                metricLabel: i18n.t('ui.app.underlyingAssets'),
                tone: underlyingMetricTone,
              },
            ]}
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
            metrics={[
              {
                percentage: rawAllocationData.loading
                  ? null
                  : classificationReliabilityPct,
                amount: classificationMappedValue,
                metricLabel: i18n.t('ui.app.diversification'),
                tone: classificationMetricTone,
              },
              {
                percentage: scopedFundQuality.report
                  ? underlyingReliabilityPct
                  : null,
                amount: identifiedFundValue,
                metricLabel: i18n.t('ui.app.underlyingAssets'),
                tone: underlyingMetricTone,
              },
            ]}
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

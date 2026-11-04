import { useMemo } from 'react'

import { useBuildAnalysisReliabilityMetrics } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/helpers/presenters/useBuildAnalysisReliabilityMetrics'
import { useFormatPipelineStatus } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatPipelineStatus'
import type { buildDataQualitySummary } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/buildDataQualitySummary'
import i18n from '@/i18n/i18n'

export function useCombinedReliabilityPresentation({
  summary,
  allocationLoading,
  pipelineErrorsLoading,
  variant,
}: CombinedReliabilityInput) {
  const formatPipelineStatus = useFormatPipelineStatus()
  const buildAnalysisReliabilityMetrics = useBuildAnalysisReliabilityMetrics()
  return useMemo(() => {
    const { reliabilityMetrics, portfolioStatusMetric } =
      buildAnalysisReliabilityMetrics({
        allocationLoading,
        classificationReliabilityPct: summary.classificationReliabilityPct,
        classificationMappedValue: summary.classificationMappedValue,
        classificationMetricTone: summary.classificationMetricTone,
        underlyingReliabilityPct: summary.underlyingReliabilityPct,
        identifiedFundValue: summary.identifiedFundValue,
        underlyingMetricTone: summary.underlyingMetricTone,
        portfolioDataTone: summary.portfolioDataTone,
        portfolioDataStatus: formatPipelineStatus({
          errorCount: summary.scopedPipelineErrorCount,
          warningCount: summary.scopedPipelineWarningCount,
          loading: pipelineErrorsLoading,
        }),
      })
    if (variant === 'portfolio')
      return {
        metrics: reliabilityMetrics,
        statusMetric: portfolioStatusMetric,
        tone: summary.overviewReliabilityTone,
        qualityTheme: summary.overviewQualityTheme,
        tooltip: i18n.t(
          'ui.app.aggregateReliabilityForPortfolioDataDiversificationMappingAndUnderlying',
        ),
        scope: { account: 'filterable', period: 'mixed' } as const,
      }
    return {
      metrics: reliabilityMetrics,
      statusMetric: undefined,
      tone: summary.diversificationReliabilityTone,
      qualityTheme: summary.diversificationQualityTheme,
      tooltip: i18n.t(
        'ui.app.aggregateReliabilityForDiversificationMappingAndUnderlyingAssetsLook',
      ),
      scope: { account: 'filterable', period: 'latest' } as const,
    }
  }, [
    allocationLoading,
    buildAnalysisReliabilityMetrics,
    formatPipelineStatus,
    pipelineErrorsLoading,
    summary,
    variant,
  ])
}

export type CombinedReliabilityInput = {
  summary: Pick<
    ReturnType<typeof buildDataQualitySummary>,
    | 'classificationReliabilityPct'
    | 'classificationMappedValue'
    | 'classificationMetricTone'
    | 'underlyingReliabilityPct'
    | 'identifiedFundValue'
    | 'underlyingMetricTone'
    | 'portfolioDataTone'
    | 'scopedPipelineErrorCount'
    | 'scopedPipelineWarningCount'
    | 'overviewReliabilityTone'
    | 'overviewQualityTheme'
    | 'diversificationReliabilityTone'
    | 'diversificationQualityTheme'
  >
  allocationLoading: boolean
  pipelineErrorsLoading: boolean
  variant: 'portfolio' | 'diversification'
}

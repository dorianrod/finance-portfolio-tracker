import type {
  AnalysisReliabilityMetric,
  AnalysisReliabilityTone,
  StatusReliabilityMetric,
} from '@/domains/portfolio/shared/helpers/quality/analysisReliability/analysisReliability.types'
import i18n from '@/i18n/i18n'

export function buildAnalysisReliabilityMetrics(
  input: ReliabilityMetricInput,
): {
  reliabilityMetrics: AnalysisReliabilityMetric[]
  portfolioStatusMetric: StatusReliabilityMetric
} {
  return {
    reliabilityMetrics: [
      {
        percentage: input.allocationLoading
          ? null
          : input.classificationReliabilityPct,
        amount: input.classificationMappedValue,
        metricLabel: i18n.t('ui.app.diversification'),
        tone: input.classificationMetricTone,
      },
      {
        percentage: input.underlyingReliabilityPct,
        amount: input.identifiedFundValue,
        metricLabel: i18n.t('ui.app.underlyingAssets'),
        tone: input.underlyingMetricTone,
      },
    ],
    portfolioStatusMetric: {
      value: input.portfolioDataStatus,
      metricLabel: i18n.t('ui.app.portfolioData'),
      tone: input.portfolioDataTone,
    },
  }
}

type ReliabilityMetricInput = {
  allocationLoading: boolean
  classificationReliabilityPct: number | null
  classificationMappedValue: number
  classificationMetricTone: AnalysisReliabilityTone
  underlyingReliabilityPct: number | null
  identifiedFundValue: number
  underlyingMetricTone: AnalysisReliabilityTone
  portfolioDataStatus: string
  portfolioDataTone: AnalysisReliabilityTone
}

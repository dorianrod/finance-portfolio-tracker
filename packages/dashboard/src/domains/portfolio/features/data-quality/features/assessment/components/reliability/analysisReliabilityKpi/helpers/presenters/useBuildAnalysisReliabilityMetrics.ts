import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { AnalysisReliabilityMetric } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityMetric.type'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { StatusReliabilityMetric } from '@/domains/portfolio/features/data-quality/features/assessment/types/statusReliabilityMetric.type'

export function useBuildAnalysisReliabilityMetrics() {
  const { t } = useTranslation()
  return useCallback(
    (
      input: ReliabilityMetricInput,
    ): {
      reliabilityMetrics: AnalysisReliabilityMetric[]
      portfolioStatusMetric: StatusReliabilityMetric
    } => {
      return {
        reliabilityMetrics: [
          {
            percentage: input.allocationLoading
              ? null
              : input.classificationReliabilityPct,
            amount: input.classificationMappedValue,
            metricLabel: t('ui.app.diversification'),
            tone: input.classificationMetricTone,
          },
          {
            percentage: input.underlyingReliabilityPct,
            amount: input.identifiedFundValue,
            metricLabel: t('ui.app.underlyingAssets'),
            tone: input.underlyingMetricTone,
          },
        ],
        portfolioStatusMetric: {
          value: input.portfolioDataStatus,
          metricLabel: t('ui.app.portfolioData'),
          tone: input.portfolioDataTone,
        },
      }
    },
    [t],
  )
}
type ReliabilityMetricInput = {
  allocationLoading: boolean
  // No classification percentage exists without applicable exposure.
  classificationReliabilityPct: number | null
  classificationMappedValue: number
  classificationMetricTone: AnalysisReliabilityTone
  // No underlying reliability percentage exists without a coverage report.
  underlyingReliabilityPct: number | null
  identifiedFundValue: number
  underlyingMetricTone: AnalysisReliabilityTone
  portfolioDataStatus: string
  portfolioDataTone: AnalysisReliabilityTone
}

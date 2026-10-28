import type { CombinedReliabilityInput } from '@/domains/portfolio/features/data-quality/features/assessment/components/reliability/analysisReliabilityKpi/services/useCombinedReliabilityPresentation'

export function makeCombinedReliabilitySummary(
  overrides: Partial<CombinedReliabilityInput['summary']> = {},
): CombinedReliabilityInput['summary'] {
  return {
    classificationReliabilityPct: 100,
    classificationMappedValue: 120000,
    classificationMetricTone: 'healthy',
    underlyingReliabilityPct: 54,
    identifiedFundValue: 64800,
    underlyingMetricTone: 'critical',
    portfolioDataTone: 'healthy',
    scopedPipelineErrorCount: 0,
    scopedPipelineWarningCount: 0,
    overviewReliabilityTone: 'critical',
    overviewQualityTheme: 'classification',
    diversificationReliabilityTone: 'critical',
    diversificationQualityTheme: 'lookthrough',
    ...overrides,
  }
}

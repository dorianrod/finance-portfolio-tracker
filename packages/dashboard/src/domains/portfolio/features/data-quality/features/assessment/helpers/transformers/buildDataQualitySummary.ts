import { aggregateReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/aggregateReliabilityTone'
import { percentageReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/percentageReliabilityTone'
import { pipelineReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/pipelineReliabilityTone'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import { computeFundExposurePercentages } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/computeFundExposurePercentages'
import type { ScopedFundQualityData } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/scopeFundQualityData.types'
import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { partitionPercentages } from '@/shared/helpers/transformers/partitionPercentages'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; This joins classification, look-through and pipeline reliability; tone policies and display metrics are delegated to their existing helpers.
export function buildDataQualitySummary({
  allocationLoading,
  coverage,
  pipelineErrorsLoading,
  scopedFundQuality,
  scopedManualPriceOverrides,
  scopedPipelineErrors,
}: BuildDataQualitySummaryInput) {
  const classificationMappedValue = coverage.reduce(
    (sum, item) => sum + item.allocated,
    0,
  )
  const classificationUnmappedValue = coverage.reduce(
    (sum, item) => sum + item.unallocated,
    0,
  )
  const classificationNotApplicableValue = coverage.reduce(
    (sum, item) => sum + item.notApplicable,
    0,
  )
  const classificationApplicableValue =
    classificationMappedValue + classificationUnmappedValue
  const classificationReliabilityPct =
    classificationApplicableValue > 0
      ? (classificationMappedValue / classificationApplicableValue) * 100
      : null
  const unallocatedPct = allocationLoading
    ? null
    : partitionPercentages([
        classificationMappedValue,
        classificationUnmappedValue,
        classificationNotApplicableValue,
      ])[1]

  const hasFundValidationError = scopedFundQuality.statuses.some(
    (status) => status.validationStatus === 'error',
  )
  const unresolvedFundValue = scopedFundQuality.report
    ? scopedFundQuality.report.undisclosedFundValue +
      scopedFundQuality.report.opaqueValue
    : 0
  const identifiedFundValue = scopedFundQuality.report
    ? scopedFundQuality.report.directIdentifiedValue +
      scopedFundQuality.report.decomposedValue
    : 0
  const fundExposurePercentages = computeFundExposurePercentages(
    identifiedFundValue,
    unresolvedFundValue,
    scopedFundQuality.notApplicableValue,
  )
  const underlyingReliabilityPct = scopedFundQuality.report
    ? fundExposurePercentages.identified
    : null
  const underlyingCritical =
    hasFundValidationError ||
    scopedFundQuality.report?.feasibilityStatus === 'limited'
  const classificationMetricTone = percentageReliabilityTone(
    allocationLoading ? null : classificationReliabilityPct,
  )
  let underlyingMetricTone: AnalysisReliabilityTone = percentageReliabilityTone(
    scopedFundQuality.report ? underlyingReliabilityPct : null,
  )
  if (underlyingCritical) underlyingMetricTone = 'critical'
  else if (
    scopedFundQuality.report?.feasibilityStatus === 'pending_repeatability'
  ) {
    underlyingMetricTone = 'warning'
  }
  const diversificationReliabilityTone = aggregateReliabilityTone([
    classificationMetricTone,
    underlyingMetricTone,
  ])
  const diversificationQualityTheme = weakestQualityTheme([
    { theme: 'classification', tone: classificationMetricTone },
    { theme: 'lookthrough', tone: underlyingMetricTone },
  ])

  const scopedPipelineErrorCount = scopedPipelineErrors.filter(
    (item) => item.level === 'error',
  ).length
  const scopedPipelineWarningCount =
    scopedPipelineErrors.length - scopedPipelineErrorCount
  const portfolioDataTone = pipelineReliabilityTone({
    errorCount: scopedPipelineErrorCount,
    warningCount: scopedPipelineWarningCount,
    loading: pipelineErrorsLoading,
  })
  const overviewReliabilityTone = aggregateReliabilityTone([
    portfolioDataTone,
    classificationMetricTone,
    underlyingMetricTone,
  ])
  const overviewQualityTheme = weakestQualityTheme([
    { theme: 'pipeline', tone: portfolioDataTone },
    { theme: 'classification', tone: classificationMetricTone },
    { theme: 'lookthrough', tone: underlyingMetricTone },
  ])
  const qualityCount =
    Number(scopedPipelineErrors.length > 0) +
    Number(scopedManualPriceOverrides.length > 0) +
    Number(hasMaterialQualityGap(unallocatedPct ?? 0)) +
    Number(
      hasFundValidationError ||
        hasMaterialQualityGap(fundExposurePercentages.unresolved),
    )

  return {
    classificationMappedValue,
    classificationMetricTone,
    classificationReliabilityPct,
    diversificationQualityTheme,
    diversificationReliabilityTone,
    hasFundValidationError,
    hasPipelineError: scopedPipelineErrorCount > 0,
    identifiedFundValue,
    overviewQualityTheme,
    overviewReliabilityTone,
    portfolioDataTone,
    qualityCount,
    scopedPipelineErrorCount,
    scopedPipelineWarningCount,
    underlyingMetricTone,
    underlyingReliabilityPct,
  }
}

type BuildDataQualitySummaryInput = {
  allocationLoading: boolean
  coverage: AccountCoverage[]
  pipelineErrorsLoading: boolean
  scopedFundQuality: ScopedFundQualityData
  scopedManualPriceOverrides: ManualPriceOverride[]
  scopedPipelineErrors: PipelineError[]
}

const RELIABILITY_PRIORITY: Record<AnalysisReliabilityTone, number> = {
  healthy: 0,
  warning: 1,
  unavailable: 2,
  critical: 3,
}

function weakestQualityTheme(
  metrics: Array<{ theme: QualityThemeId; tone: AnalysisReliabilityTone }>,
): QualityThemeId {
  return metrics.reduce((mostRelevant, candidate) =>
    RELIABILITY_PRIORITY[candidate.tone] >
    RELIABILITY_PRIORITY[mostRelevant.tone]
      ? candidate
      : mostRelevant,
  ).theme
}

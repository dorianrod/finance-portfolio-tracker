import { aggregateReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/aggregateReliabilityTone'
import { percentageReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/percentageReliabilityTone'
import { pipelineReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/analysisReliability/pipelineReliabilityTone'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import { computeFundExposurePercentages } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/computeFundExposurePercentages'
import type { ScopedFundQualityData } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/scopeFundQualityData.types'
import type { AccountCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/types/accountCoverage.type'
import type { AnalysisReliabilityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/analysisReliabilityTone.type'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import { countPipelineIssues } from '@/domains/portfolio/features/data-quality/shared/helpers/transformers/countPipelineIssues'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { partitionPercentages } from '@/shared/helpers/transformers/partitionPercentages'

export function buildDataQualitySummary({
  allocationLoading,
  coverage,
  pipelineErrorsLoading,
  scopedFundQuality,
  scopedManualPriceOverrides,
  scopedPipelineErrors,
}: BuildDataQualitySummaryInput) {
  const {
    classificationMappedValue,
    classificationMetricTone,
    classificationReliabilityPct,
    unallocatedPct,
  } = classificationSummary(coverage, allocationLoading)
  const {
    hasFundValidationError,
    identifiedFundValue,
    fundExposurePercentages,
    underlyingMetricTone,
    underlyingReliabilityPct,
  } = underlyingSummary(scopedFundQuality)
  const diversificationReliabilityTone = aggregateReliabilityTone([
    classificationMetricTone,
    underlyingMetricTone,
  ])
  const diversificationQualityTheme = weakestQualityTheme([
    { theme: 'classification', tone: classificationMetricTone },
    { theme: 'lookthrough', tone: underlyingMetricTone },
  ])

  const {
    errorCount: scopedPipelineErrorCount,
    warningCount: scopedPipelineWarningCount,
  } = countPipelineIssues(scopedPipelineErrors)
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

function classificationSummary(
  coverage: AccountCoverage[],
  allocationLoading: boolean,
) {
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

  const classificationMetricTone = percentageReliabilityTone(
    allocationLoading ? null : classificationReliabilityPct,
  )
  return {
    classificationMappedValue,
    classificationMetricTone,
    classificationReliabilityPct,
    unallocatedPct,
  }
}

function underlyingSummary(scopedFundQuality: ScopedFundQualityData) {
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
  const underlyingMetricTone = underlyingReliabilityTone(
    scopedFundQuality,
    underlyingReliabilityPct,
    hasFundValidationError,
  )
  return {
    hasFundValidationError,
    identifiedFundValue,
    fundExposurePercentages,
    underlyingMetricTone,
    underlyingReliabilityPct,
  }
}

function underlyingReliabilityTone(
  scopedFundQuality: ScopedFundQualityData,
  percentage: number | null,
  hasValidationError: boolean,
): AnalysisReliabilityTone {
  const status = scopedFundQuality.report?.feasibilityStatus
  if (hasValidationError || status === 'limited') return 'critical'
  if (status === 'pending_repeatability') return 'warning'
  return percentageReliabilityTone(percentage)
}

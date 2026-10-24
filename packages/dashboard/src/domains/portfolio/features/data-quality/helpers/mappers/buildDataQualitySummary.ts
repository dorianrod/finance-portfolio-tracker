import {
  aggregateReliabilityTone,
  type AnalysisReliabilityTone,
  percentageReliabilityTone,
  pipelineReliabilityTone,
  pipelineStatusLabel,
} from '@/domains/portfolio/shared/helpers/quality/analysisReliability'
import type { AccountCoverage } from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds'
import {
  computeFundExposurePercentages,
  type ScopedFundQualityData,
} from '@/domains/portfolio/shared/helpers/quality/scopeFundQualityData'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'

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
  const portfolioDataStatus = pipelineStatusLabel({
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
    portfolioDataStatus,
    portfolioDataTone,
    qualityCount,
    scopedPipelineErrorCount,
    scopedPipelineWarningCount,
    underlyingMetricTone,
    underlyingReliabilityPct,
  }
}

import { useCallback } from 'react'

import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/businessRules/hasMaterialQualityGap'
import { buildClassificationViewState } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildClassificationViewState'
import { computeAllocationCoverageByAccount } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/computeAllocationCoverageByAccount'
import { computeAllocationCoverageByDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/computeAllocationCoverage/computeAllocationCoverageByDimension'
import { computeFundExposurePercentages } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/scopeFundQualityData/computeFundExposurePercentages'
import { scopeFundQualityData } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/scopeFundQualityData/scopeFundQualityData'
import type { AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/types/affectedAsset.type'
import type { QualityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import type { QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/types/qualityTheme.type'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import i18n from '@/i18n/i18n'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useBuildDataQualityViewModel() {
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  return useCallback(
    ({
      positions,
      errors,
      manualPriceOverrides,
      fundStatuses,
      fundReport,
      fundHoldings,
      fundSnapshots,
      fundUnresolved,
      rawData,
    }: DataQualityTabProps) => {
      const coverage = rawData.loading
        ? []
        : computeAllocationCoverageByAccount(positions, rawData)
      const dimensionCoverage = rawData.loading
        ? []
        : computeAllocationCoverageByDimension(positions, rawData)
      const scopedFundData = scopeFundQualityData(
        positions,
        fundHoldings,
        fundStatuses,
        fundSnapshots,
        fundUnresolved,
        fundReport,
      )

      const classificationMappedValue = coverage.reduce(
        (sum, item) => sum + item.allocated,
        0,
      )
      const classificationUnmappedValue = coverage.reduce(
        (sum, item) => sum + item.unallocated,
        0,
      )
      const classificationApplicableValue =
        classificationMappedValue + classificationUnmappedValue
      const classificationNotApplicableValue = coverage.reduce(
        (sum, item) => sum + item.notApplicable,
        0,
      )
      const [, classificationGap] = partitionPercentages([
        classificationMappedValue,
        classificationUnmappedValue,
        classificationNotApplicableValue,
      ])
      const classificationIsNotApplicable =
        !rawData.loading &&
        classificationApplicableValue <= 0 &&
        classificationNotApplicableValue > 0
      const classificationViewState = buildClassificationViewState({
        loading: rawData.loading,
        classificationIsNotApplicable,
        coverage,
        dimensionCoverage,
      })
      const affectedAssets = buildAffectedAssets(dimensionCoverage)

      const unresolvedValue = scopedFundData.report
        ? scopedFundData.report.undisclosedFundValue +
          scopedFundData.report.opaqueValue
        : 0
      const identifiedValue = scopedFundData.report
        ? scopedFundData.report.directIdentifiedValue +
          scopedFundData.report.decomposedValue
        : 0
      const unresolvedPct = computeFundExposurePercentages(
        identifiedValue,
        unresolvedValue,
        scopedFundData.notApplicableValue,
      ).unresolved
      const fundErrorCount = scopedFundData.statuses.filter(
        (status) => status.validationStatus === 'error',
      ).length
      const fundIssueCount = scopedFundData.statuses.filter(
        (status) =>
          status.validationStatus !== 'ok' ||
          hasMaterialQualityGap(status.residualPct),
      ).length
      const hasLookThroughScope =
        !!scopedFundData.report && scopedFundData.report.portfolioValue > 0

      const themes = [
        buildPipelineTheme(errors, formatNumber(errors.length)),
        buildManualPricesTheme(
          manualPriceOverrides,
          formatNumber(manualPriceOverrides.length),
        ),
        buildClassificationTheme(
          classificationGap,
          rawData.loading,
          classificationIsNotApplicable,
          formatPercentage(classificationGap),
        ),
        buildLookThroughTheme(
          Boolean(scopedFundData.report),
          hasLookThroughScope,
          unresolvedPct,
          fundErrorCount,
          formatPercentage(unresolvedPct),
        ),
      ]

      const recommendedTheme = themes.reduce(
        (highest, theme) =>
          theme.priority > highest.priority ? theme : highest,
        themes[0],
      )

      return {
        affectedAssets,
        classificationApplicableValue,
        classificationViewState,
        fundIssueCount,
        hasLookThroughScope,
        recommendedTheme,
        scopedFundData,
        themes,
      }
    },
    [formatNumber, formatPercentage],
  )
}

function buildAffectedAssets(
  dimensionCoverage: ReturnType<typeof computeAllocationCoverageByDimension>,
): AffectedAsset[] {
  const byAsset = new Map<string, AffectedAsset>()

  for (const dimension of dimensionCoverage) {
    for (const issue of dimension.issues) {
      const gapPct =
        issue.value > 0 ? (issue.unallocated / issue.value) * 100 : 0
      const current = byAsset.get(issue.id) ?? {
        id: issue.id,
        name: issue.name,
        value: issue.value,
        dimensions: [],
        largestGapValue: 0,
        largestGapPct: 0,
      }

      current.value = Math.max(current.value, issue.value)
      if (!current.dimensions.includes(dimension.dimension)) {
        current.dimensions.push(dimension.dimension)
      }
      if (issue.unallocated > current.largestGapValue) {
        current.largestGapValue = issue.unallocated
        current.largestGapPct = gapPct
      }
      byAsset.set(issue.id, current)
    }
  }

  return [...byAsset.values()].toSorted(
    (left, right) => right.largestGapValue - left.largestGapValue,
  )
}

function buildPipelineTheme(
  errors: PipelineError[],
  formattedCount: string,
): QualityTheme {
  const errorCount = errors.filter((item) => item.level === 'error').length
  const warningCount = errors.length - errorCount
  let pipelineTone: QualityTone = 'healthy'
  let pipelinePriority = 0
  if (errorCount > 0) {
    pipelineTone = 'critical'
    pipelinePriority = 1_000 + errorCount
  } else if (warningCount > 0) {
    pipelineTone = 'warning'
    pipelinePriority = 700 + warningCount
  }

  return {
    id: 'pipeline',
    label: i18n.t('ui.builddataqualityviewmodelTs.portfolioData'),
    description: i18n.t(
      'ui.builddataqualityviewmodelTs.importPositionAndMarketDataAnomaliesDetectedDuringThe',
    ),
    metric: formattedCount,
    metricLabel: i18n.t('ui.builddataqualityviewmodel.anomalyLabel', {
      count: errors.length,
    }),
    tone: pipelineTone,
    priority: pipelinePriority,
  }
}
function buildManualPricesTheme(
  manualPriceOverrides: ManualPriceOverride[],
  formattedCount: string,
): QualityTheme {
  return {
    id: 'prices',
    label: i18n.t('ui.builddataqualityviewmodelTs.manualPrices'),
    description: i18n.t(
      'ui.builddataqualityviewmodelTs.overridesThatReplaceAutomaticMarketPrices',
    ),
    metric: formattedCount,
    metricLabel: i18n.t('ui.builddataqualityviewmodel.overrideLabel', {
      count: manualPriceOverrides.length,
    }),
    tone: manualPriceOverrides.length > 0 ? 'warning' : 'healthy',
    priority:
      manualPriceOverrides.length > 0 ? 400 + manualPriceOverrides.length : 0,
  }
}
function buildClassificationTheme(
  classificationGap: number,
  loading: boolean,
  classificationIsNotApplicable: boolean,
  formattedPercentage: string,
): QualityTheme {
  let classificationMetric = formattedPercentage
  let classificationMetricLabel = i18n.t(
    'ui.builddataqualityviewmodel.unmapped',
  )
  let classificationTone: QualityTone = hasMaterialQualityGap(classificationGap)
    ? 'warning'
    : 'healthy'
  let classificationPriority = hasMaterialQualityGap(classificationGap)
    ? 500 + classificationGap
    : 0
  if (loading) {
    classificationMetric = '—'
    classificationMetricLabel = i18n.t('ui.builddataqualityviewmodel.loading')
    classificationTone = 'unavailable'
    classificationPriority = -1
  } else if (classificationIsNotApplicable) {
    classificationMetric = i18n.t(
      'ui.builddataqualityviewmodel.notApplicableShort',
    )
    classificationMetricLabel = i18n.t(
      'ui.builddataqualityviewmodel.notApplicable',
    )
    classificationTone = 'unavailable'
    classificationPriority = -1
  }

  return {
    id: 'classification',
    label: i18n.t('ui.builddataqualityviewmodelTs.diversification'),
    description: i18n.t(
      'ui.builddataqualityviewmodelTs.completenessOfAssetClassGeographySectorAndCurrencyData',
    ),
    metric: classificationMetric,
    metricLabel: classificationMetricLabel,
    tone: classificationTone,
    priority: classificationPriority,
  }
}
function buildLookThroughTheme(
  hasReport: boolean,
  hasLookThroughScope: boolean,
  unresolvedPct: number,
  fundErrorCount: number,
  formattedPercentage: string,
): QualityTheme {
  let lookThroughMetric = hasReport
    ? i18n.t('ui.builddataqualityviewmodel.notApplicableShort')
    : '—'
  let lookThroughMetricLabel = hasReport
    ? i18n.t('ui.builddataqualityviewmodel.notApplicable')
    : i18n.t('ui.builddataqualityviewmodel.notAvailable')
  let lookThroughTone: QualityTone = 'unavailable'
  let lookThroughPriority = -1
  if (hasLookThroughScope) {
    lookThroughMetric = formattedPercentage
    lookThroughMetricLabel = i18n.t('ui.builddataqualityviewmodel.unresolved')
    if (fundErrorCount > 0) {
      lookThroughTone = 'critical'
      lookThroughPriority = 900 + fundErrorCount
    } else if (hasMaterialQualityGap(unresolvedPct)) {
      lookThroughTone = 'warning'
      lookThroughPriority = 600 + unresolvedPct
    } else {
      lookThroughTone = 'healthy'
      lookThroughPriority = 0
    }
  }

  return {
    id: 'lookthrough',
    label: i18n.t('ui.builddataqualityviewmodelTs.underlyingExposure'),
    description: i18n.t(
      'ui.builddataqualityviewmodelTs.transparencyAndSourceReliabilityOfUnderlyingFundExposures',
    ),
    metric: lookThroughMetric,
    metricLabel: lookThroughMetricLabel,
    tone: lookThroughTone,
    priority: lookThroughPriority,
  }
}

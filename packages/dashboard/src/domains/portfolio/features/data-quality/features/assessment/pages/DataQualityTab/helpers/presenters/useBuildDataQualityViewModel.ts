import { useCallback } from 'react'

import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import { buildDataQualityAssessment } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/transformers/buildDataQualityAssessment'
import type { QualityTone } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import type { QualityTheme } from '@/domains/portfolio/features/data-quality/features/assessment/types/qualityTheme.type'
import { countPipelineIssues } from '@/domains/portfolio/features/data-quality/shared/helpers/transformers/countPipelineIssues'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

/*
 * @architecture-decision data-quality-assessment-before-presentation
 * @rules helpers-categories
 * @choice Build domain diagnostics in the pure page-owned assessment before mapping its themes.
 * @reason Affected assets and exposure availability also drive inspection actions without translated display data.
 * @alternative Moving the whole adapter to transformers would bring translation and visual theme policy into business calculations.
 * @revisit Another capability consumes this page's assessment or the diagnostic policy changes ownership.
 */
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
      const {
        affectedAssets,
        classificationApplicableValue,
        classificationGap,
        classificationIsNotApplicable,
        classificationViewState,
        fundErrorCount,
        fundIssueCount,
        hasLookThroughScope,
        scopedFundData,
        unresolvedPct,
      } = buildDataQualityAssessment({
        positions,
        fundStatuses,
        fundReport,
        fundHoldings,
        fundSnapshots,
        fundUnresolved,
        rawData,
      })

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

function buildPipelineTheme(
  errors: PipelineError[],
  formattedCount: string,
): QualityTheme {
  const { errorCount, warningCount } = countPipelineIssues(errors)
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

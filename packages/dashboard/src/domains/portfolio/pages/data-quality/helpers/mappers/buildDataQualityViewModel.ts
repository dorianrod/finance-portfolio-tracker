import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/apis/queries/useFundHoldings'
import type { RawIsinData } from '@/domains/portfolio/apis/queries/useRawIsinData'
import {
  computeAllocationCoverageByAccount,
  computeAllocationCoverageByDimension,
} from '@/domains/portfolio/components/allocation-charts/helpers/quality/computeAllocationCoverage'
import {
  computeFundExposurePercentages,
  scopeFundQualityData,
} from '@/domains/portfolio/components/fund-holdings/helpers/quality/scopeFundQualityData'
import { hasMaterialQualityGap } from '@/domains/portfolio/helpers/quality/qualityThresholds'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'
import type { ErrorRow } from '@/domains/portfolio/apis/queries/useErrors'
import type { ManualPriceOverride } from '@/domains/portfolio/apis/queries/useManualPriceOverrides'
import type { QualityThemeId, QualityTone } from '@/domains/portfolio/types/quality'

export const DATA_QUALITY_DIMENSION_LABELS = {
  geo: 'geography',
  secteur: 'sector',
  currency: 'currency',
  classe: 'asset class',
} as const

export type DataQualityDimension = keyof typeof DATA_QUALITY_DIMENSION_LABELS
export interface QualityTheme {
  id: QualityThemeId
  label: string
  description: string
  metric: string
  metricLabel: string
  tone: QualityTone
  priority: number
}

export interface AffectedAsset {
  id: string
  name: string
  value: number
  dimensions: DataQualityDimension[]
  largestGapValue: number
  largestGapPct: number
}

interface BuildDataQualityViewModelInput {
  positions: PositionRow[]
  errors: ErrorRow[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
  fundHoldings: FundHolding[]
  fundSnapshots: FundSnapshot[]
  fundUnresolved: FundUnresolved[]
  rawData: RawIsinData
  formatPercentage: (value: number) => string
}

function buildAffectedAssets(
  dimensionCoverage: ReturnType<typeof computeAllocationCoverageByDimension>,
): AffectedAsset[] {
  const byAsset = new Map<string, AffectedAsset>()

  for (const dimension of dimensionCoverage) {
    for (const issue of dimension.issues) {
      const gapPct = issue.value > 0 ? issue.unallocated / issue.value * 100 : 0
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

  return [...byAsset.values()].sort(
    (left, right) => right.largestGapValue - left.largestGapValue,
  )
}

export function buildDataQualityViewModel({
  positions,
  errors,
  manualPriceOverrides,
  fundStatuses,
  fundReport,
  fundHoldings,
  fundSnapshots,
  fundUnresolved,
  rawData,
  formatPercentage,
}: BuildDataQualityViewModelInput) {
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

  const errorCount = errors.filter((item) => item.level === 'error').length
  const warningCount = errors.length - errorCount
  const classificationMappedValue = coverage.reduce(
    (sum, item) => sum + item.allocated,
    0,
  )
  const classificationUnmappedValue = coverage.reduce(
    (sum, item) => sum + item.unallocated,
    0,
  )
  const classificationApplicableValue = classificationMappedValue + classificationUnmappedValue
  const classificationNotApplicableValue = coverage.reduce(
    (sum, item) => sum + item.notApplicable,
    0,
  )
  const [, classificationGap] = partitionPercentages([
    classificationMappedValue,
    classificationUnmappedValue,
    classificationNotApplicableValue,
  ])
  const classificationIsNotApplicable = !rawData.loading
    && classificationApplicableValue <= 0
    && classificationNotApplicableValue > 0
  const affectedAssets = buildAffectedAssets(dimensionCoverage)

  const unresolvedValue = scopedFundData.report
    ? scopedFundData.report.undisclosedFundValue + scopedFundData.report.opaqueValue
    : 0
  const identifiedValue = scopedFundData.report
    ? scopedFundData.report.directIdentifiedValue + scopedFundData.report.decomposedValue
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
    (status) => status.validationStatus !== 'ok' || hasMaterialQualityGap(status.residualPct),
  ).length
  const hasLookThroughScope = !!scopedFundData.report && scopedFundData.report.portfolioValue > 0

  let pipelineTone: QualityTone = 'healthy'
  let pipelinePriority = 0
  if (errorCount > 0) {
    pipelineTone = 'critical'
    pipelinePriority = 1_000 + errorCount
  } else if (warningCount > 0) {
    pipelineTone = 'warning'
    pipelinePriority = 700 + warningCount
  }

  let classificationMetric = formatPercentage(classificationGap)
  let classificationMetricLabel = 'unmapped'
  let classificationTone: QualityTone = hasMaterialQualityGap(classificationGap) ? 'warning' : 'healthy'
  let classificationPriority = hasMaterialQualityGap(classificationGap) ? 500 + classificationGap : 0
  if (rawData.loading) {
    classificationMetric = '—'
    classificationMetricLabel = 'loading'
    classificationTone = 'unavailable'
    classificationPriority = -1
  } else if (classificationIsNotApplicable) {
    classificationMetric = 'N/A'
    classificationMetricLabel = 'not applicable'
    classificationTone = 'unavailable'
    classificationPriority = -1
  }

  let lookThroughMetric = scopedFundData.report ? 'N/A' : '—'
  let lookThroughMetricLabel = scopedFundData.report ? 'not applicable' : 'not available'
  let lookThroughTone: QualityTone = 'unavailable'
  let lookThroughPriority = -1
  if (hasLookThroughScope) {
    lookThroughMetric = formatPercentage(unresolvedPct)
    lookThroughMetricLabel = 'unresolved'
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

  const themes: QualityTheme[] = [
    {
      id: 'pipeline',
      label: 'Portfolio data',
      description: 'Import, position and market-data anomalies detected during the latest run.',
      metric: String(errors.length),
      metricLabel: errors.length === 1 ? 'anomaly' : 'anomalies',
      tone: pipelineTone,
      priority: pipelinePriority,
    },
    {
      id: 'prices',
      label: 'Manual prices',
      description: 'Overrides that replace automatic market prices.',
      metric: String(manualPriceOverrides.length),
      metricLabel: manualPriceOverrides.length === 1 ? 'override' : 'overrides',
      tone: manualPriceOverrides.length > 0 ? 'warning' : 'healthy',
      priority: manualPriceOverrides.length > 0 ? 400 + manualPriceOverrides.length : 0,
    },
    {
      id: 'classification',
      label: 'Diversification',
      description: 'Completeness of asset class, geography, sector and currency data.',
      metric: classificationMetric,
      metricLabel: classificationMetricLabel,
      tone: classificationTone,
      priority: classificationPriority,
    },
    {
      id: 'lookthrough',
      label: 'Underlying exposure',
      description: 'Transparency and source reliability of underlying fund exposures.',
      metric: lookThroughMetric,
      metricLabel: lookThroughMetricLabel,
      tone: lookThroughTone,
      priority: lookThroughPriority,
    },
  ]

  const recommendedTheme = themes.reduce(
    (highest, theme) => theme.priority > highest.priority ? theme : highest,
    themes[0],
  )

  return {
    affectedAssets,
    classificationApplicableValue,
    classificationIsNotApplicable,
    coverage,
    dimensionCoverage,
    fundIssueCount,
    hasLookThroughScope,
    recommendedTheme,
    scopedFundData,
    themes,
  }
}

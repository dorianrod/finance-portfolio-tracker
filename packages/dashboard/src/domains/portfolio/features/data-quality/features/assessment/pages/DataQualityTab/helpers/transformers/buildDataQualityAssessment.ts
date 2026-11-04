import { buildClassificationViewState } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/buildClassificationViewState'
import { computeAllocationCoverageByAccount } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/computeAllocationCoverage/computeAllocationCoverageByAccount'
import { computeAllocationCoverageByDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/computeAllocationCoverage/computeAllocationCoverageByDimension'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import { computeFundExposurePercentages } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/computeFundExposurePercentages'
import { scopeFundQualityData } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/scopeFundQualityData'
import type { AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/types/affectedAsset.type'
import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import { partitionPercentages } from '@/shared/helpers/transformers/partitionPercentages'

export function buildDataQualityAssessment({
  positions,
  fundStatuses,
  fundReport,
  fundHoldings,
  fundSnapshots,
  fundUnresolved,
  rawData,
}: Pick<
  DataQualityTabProps,
  | 'positions'
  | 'fundStatuses'
  | 'fundReport'
  | 'fundHoldings'
  | 'fundSnapshots'
  | 'fundUnresolved'
  | 'rawData'
>) {
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

  return {
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
  }
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

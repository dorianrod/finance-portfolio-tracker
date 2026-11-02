import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import { computeFundExposurePercentages } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/scopeFundQualityData/computeFundExposurePercentages'
import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'

export function computeLookThroughMetrics(
  report: FundCoverageReport,
  notApplicableValue: number,
) {
  const identifiedValue = report.directIdentifiedValue + report.decomposedValue
  const unresolvedValue = report.undisclosedFundValue + report.opaqueValue
  const selectedPortfolioValue =
    identifiedValue + unresolvedValue + notApplicableValue
  const percentages = computeFundExposurePercentages(
    identifiedValue,
    unresolvedValue,
    notApplicableValue,
  )
  const percentage = (value: number) =>
    selectedPortfolioValue > 0 ? (value / selectedPortfolioValue) * 100 : 0
  // Confidence cannot explain more than the identified amount in this reporting scope.
  const reliableValue = Math.min(
    identifiedValue,
    report.directIdentifiedValue + report.highConfidenceExplainedValue,
  )
  const otherSourceValue = Math.max(0, identifiedValue - reliableValue)
  return {
    identifiedValue,
    unresolvedValue,
    selectedPortfolioValue,
    reliableValue,
    otherSourceValue,
    notApplicableValue,
    identifiedPercentage: percentages.identified,
    unresolvedPercentage: percentages.unresolved,
    notApplicablePercentage: percentages.notApplicable,
    hasNotApplicable: notApplicableValue > 0,
    hasUnresolvedGap: hasMaterialQualityGap(percentages.unresolved),
    reliablePercentage: percentage(reliableValue),
    otherSourcePercentage: percentage(otherSourceValue),
    directPercentage: percentage(report.directIdentifiedValue),
    decomposedPercentage: percentage(report.decomposedValue),
    undisclosedPercentage: percentage(report.undisclosedFundValue),
    opaquePercentage: percentage(report.opaqueValue),
  }
}

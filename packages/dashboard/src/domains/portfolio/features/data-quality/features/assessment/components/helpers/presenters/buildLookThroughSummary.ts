import { computeFundExposurePercentages } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/scopeFundQualityData/computeFundExposurePercentages'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds/hasMaterialQualityGap'
import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'

export function buildLookThroughSummary(
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
  const reliableValue = Math.min(
    identifiedValue,
    report.directIdentifiedValue + report.highConfidenceExplainedValue,
  )
  const otherSourceValue = Math.max(0, identifiedValue - reliableValue)
  const undisclosedPercentage = percentage(report.undisclosedFundValue)
  const opaquePercentage = percentage(report.opaqueValue)
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
    undisclosedPercentage,
    opaquePercentage,
    undisclosedTone: hasMaterialQualityGap(undisclosedPercentage)
      ? ('warning' as const)
      : ('coverage' as const),
    opaqueTone: hasMaterialQualityGap(opaquePercentage)
      ? ('error' as const)
      : ('coverage' as const),
  }
}

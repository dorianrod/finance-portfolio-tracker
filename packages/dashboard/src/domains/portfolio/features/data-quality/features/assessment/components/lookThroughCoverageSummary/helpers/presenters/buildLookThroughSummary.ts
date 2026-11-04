import { computeLookThroughMetrics } from '@/domains/portfolio/features/data-quality/features/assessment/components/lookThroughCoverageSummary/helpers/transformers/computeLookThroughMetrics'
import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'

export function buildLookThroughSummary(
  report: FundCoverageReport,
  notApplicableValue: number,
) {
  const metrics = computeLookThroughMetrics(report, notApplicableValue)
  return {
    ...metrics,
    undisclosedTone: hasMaterialQualityGap(metrics.undisclosedPercentage)
      ? ('warning' as const)
      : ('coverage' as const),
    opaqueTone: hasMaterialQualityGap(metrics.opaquePercentage)
      ? ('error' as const)
      : ('coverage' as const),
  }
}

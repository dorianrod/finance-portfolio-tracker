import { buildLookThroughSummary } from '@/domains/portfolio/features/data-quality/features/assessment/components/helpers/presenters/buildLookThroughSummary'
import { LookThroughCoverageSummaryView } from '@/domains/portfolio/features/data-quality/features/assessment/components/lookThroughCoverageSummary/LookThroughCoverageSummaryView.view'
import { UnavailableLookThroughSummary } from '@/domains/portfolio/features/data-quality/features/assessment/components/lookThroughCoverageSummary/UnavailableLookThroughSummary.view'
import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'

export function LookThroughCoverageSummary({
  report,
  variant,
  notApplicableValue = 0,
}: LookThroughCoverageSummaryProps) {
  if (!report) return <UnavailableLookThroughSummary />
  const model = buildLookThroughSummary(report, notApplicableValue)
  return (
    <LookThroughCoverageSummaryView
      report={report}
      model={model}
      variant={variant}
    >
      <LookThroughCoverageSummaryView.TooltipFooter>
        <FilterScopeBadges account="filterable" period="latest" />
      </LookThroughCoverageSummaryView.TooltipFooter>
    </LookThroughCoverageSummaryView>
  )
}

type LookThroughCoverageSummaryProps = {
  report: FundCoverageReport | null
  notApplicableValue?: number
  variant?: 'compact' | 'detailed'
}

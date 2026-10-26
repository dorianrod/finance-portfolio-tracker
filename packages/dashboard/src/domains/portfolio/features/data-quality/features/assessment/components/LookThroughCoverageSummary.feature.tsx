import { buildLookThroughSummary } from '@/domains/portfolio/features/data-quality/features/assessment/components/helpers/presenters/buildLookThroughSummary'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'

import {
  LookThroughCoverageSummaryView,
  UnavailableLookThroughSummary,
} from './LookThroughCoverageSummary.view'

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

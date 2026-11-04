import { LookThroughCoverageSummary } from '@/domains/portfolio/features/data-quality/features/assessment/components/lookThroughCoverageSummary/LookThroughCoverageSummary.feature'
import { EmptyQualityState } from '@/domains/portfolio/features/data-quality/features/assessment/pages/dataQualityDetails/EmptyQualityState.view'
import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'
import i18n from '@/i18n/i18n'

export function LookThroughQualityContent({
  report,
  notApplicableValue,
}: {
  // The optional fund coverage report may be unavailable.
  report: FundCoverageReport | null
  notApplicableValue: number
}) {
  if (report && report.portfolioValue > 0)
    return (
      <LookThroughCoverageSummary
        report={report}
        notApplicableValue={notApplicableValue}
      />
    )
  return (
    <EmptyQualityState
      message={
        report
          ? i18n.t(
              'ui.dataqualitytab.lookThroughIsNotApplicableToSavingsCheckingAnd',
            )
          : i18n.t(
              'ui.dataqualitytab.noLookThroughQualityReportRunThePortfolioPipeline',
            )
      }
    />
  )
}

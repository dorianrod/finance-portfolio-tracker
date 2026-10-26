import { LookThroughCoverageSummary } from '@/domains/portfolio/features/data-quality/features/assessment/components/LookThroughCoverageSummary.feature'
import { EmptyQualityState } from '@/domains/portfolio/features/data-quality/features/assessment/pages/dataQualityDetails/EmptyQualityState.view'
import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'

export function LookThroughQualityContent({
  report,
  notApplicableValue,
}: {
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

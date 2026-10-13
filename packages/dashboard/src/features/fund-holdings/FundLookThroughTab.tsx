import type { FundCoverageReport, FundHolding } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { FundHoldingsExplorer } from './FundHoldingsExplorer'
import { LookThroughCoverageSummary } from './LookThroughCoverageSummary'

export function FundLookThroughTab({ positions, holdings, report }: {
  positions: PositionRow[]
  holdings: FundHolding[]
  report: FundCoverageReport | null
}) {
  const enabled = report?.feasibilityStatus === 'passed'
  return (
    <div className="mb-6 space-y-4">
      <LookThroughCoverageSummary report={report} compact />
      {enabled
        ? <FundHoldingsExplorer positions={positions} holdings={holdings} />
        : <section className="rounded-xl border border-amber-900/70 bg-amber-950/20 p-5"><h2 className="font-semibold text-amber-200">Complete view not enabled yet</h2><p className="mt-1 text-sm text-amber-200/70">The detailed issuer view is activated after the coverage, exact-proxy and two-refresh repeatability gates pass. Diagnostics remain available in Data quality.</p></section>}
    </div>
  )
}

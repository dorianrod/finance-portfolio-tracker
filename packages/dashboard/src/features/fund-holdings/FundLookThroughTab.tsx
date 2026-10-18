import type { FundCoverageReport, FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { FundHoldingsExplorer } from './FundHoldingsExplorer'
import { LookThroughCoverageSummary } from './LookThroughCoverageSummary'

export function FundLookThroughTab({ positions, holdings, statuses, report, query, onQueryChange }: {
  positions: PositionRow[]
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  report: FundCoverageReport | null
  query: string
  onQueryChange: (query: string) => void
}) {
  return (
    <div className="mb-6 space-y-4">
      <LookThroughCoverageSummary report={report} compact />
      {holdings.length > 0
        ? <FundHoldingsExplorer positions={positions} holdings={holdings} statuses={statuses} query={query} onQueryChange={onQueryChange} />
        : <section className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="font-semibold text-gray-200">No identified underlying exposure yet</h2><p className="mt-1 text-sm text-gray-500">Unresolved composite positions remain listed with their monetary impact in Data quality.</p></section>}
    </div>
  )
}

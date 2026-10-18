import type { FundHolding, FundHoldingStatus } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { isAssetAnalysisApplicablePosition } from '@/shared/quality/accountApplicability'
import { FundHoldingsExplorer } from './FundHoldingsExplorer'

export function FundLookThroughTab({ positions, holdings, statuses, query, onQueryChange }: {
  positions: PositionRow[]
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  query: string
  onQueryChange: (query: string) => void
}) {
  const applicablePositions = positions.filter((position) => (
    position.status === 'active'
    && (position.total_value ?? 0) > 0
    && isAssetAnalysisApplicablePosition(position)
  ))

  return (
    <div className="mb-6 space-y-4">
      {applicablePositions.length === 0
        ? <section className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="font-semibold text-gray-200">Underlying assets not applicable</h2><p className="mt-1 text-sm text-gray-500">Underlying-asset analysis is not applicable to savings, checking and brokerage-cash accounts.</p></section>
        : holdings.length > 0
        ? <FundHoldingsExplorer positions={applicablePositions} holdings={holdings} statuses={statuses} query={query} onQueryChange={onQueryChange} />
        : <section className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="font-semibold text-gray-200">No identified underlying exposure yet</h2><p className="mt-1 text-sm text-gray-500">Unresolved composite positions remain listed with their monetary impact in Data quality.</p></section>}
    </div>
  )
}

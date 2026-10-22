import type { FundHolding } from '@/domains/portfolio/apis/queries/useFundHoldings'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/helpers/quality/accountApplicability'
import { FundHoldingsExplorer } from './FundHoldingsExplorer'
import { InfoTooltip } from '@/domains/portfolio/components/kpis/InfoTooltip'

export function FundLookThroughTab({
  positions,
  holdings,
}: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const applicablePositions = positions.filter((position) => (
    position.status === 'active'
    && (position.total_value ?? 0) > 0
    && isAssetAnalysisApplicablePosition(position)
  ))

  let content = <section className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="flex items-center font-semibold text-gray-200">No identified underlying exposure yet<InfoTooltip text="Unresolved composite positions remain listed with their monetary impact in Data quality." scope={{ account: 'filterable', period: 'as-of' }} /></h2><p className="mt-1 text-sm text-gray-500">Unresolved composite positions remain listed with their monetary impact in Data quality.</p></section>
  if (applicablePositions.length === 0) {
    content = <section className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h2 className="flex items-center font-semibold text-gray-200">Underlying exposure not applicable<InfoTooltip text="Look-through analysis is not applicable to savings, checking and brokerage-cash accounts." scope={{ account: 'filterable', period: 'as-of' }} /></h2><p className="mt-1 text-sm text-gray-500">Look-through analysis is not applicable to savings, checking and brokerage-cash accounts.</p></section>
  } else if (holdings.length > 0) {
    content = <FundHoldingsExplorer positions={applicablePositions} holdings={holdings} />
  }

  return (
    <div className="mb-6 space-y-4">
      {content}
    </div>
  )
}

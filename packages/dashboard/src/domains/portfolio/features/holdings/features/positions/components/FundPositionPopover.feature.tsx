import i18n from '@/i18n/i18n'
import { createPortal } from 'react-dom'
import { useAtomValue } from 'jotai'
import { useFundHoldingsData } from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import type {
  FundHolding,
  FundHoldingStatus,
  HistoricalFundHolding,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { computeAllocationPopoverPosition } from '@/domains/portfolio/shared/helpers/presenters/computeAllocationPopoverPosition'
import { selectHistoricalFundHoldingsAtDate } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import { holdingsForPosition } from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'

const EMPTY_FUND_HOLDINGS: FundHolding[] = []
const EMPTY_HISTORICAL_FUND_HOLDINGS: HistoricalFundHolding[] = []

export interface FundPositionPopoverTarget {
  position: PositionRow
  status: FundHoldingStatus
  buttonRect: DOMRect
}

function FundPositionHoldingRow({ holding, position }: { holding: FundHolding; position: PositionRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const positionValue = position.total_value ?? 0
  return <div className="grid grid-cols-[minmax(0,1fr)_4rem_6rem] items-baseline gap-3 border-b border-gray-800/70 py-1.5 text-xs"><span className="truncate text-gray-300" title={holding.holdingName}>{holding.holdingName}</span><span className="text-right tabular-nums text-gray-500">{formatPercentage(holding.weight * 100, { decimals: 2 })}</span><span className="text-right tabular-nums text-gray-400">{formatMoney(positionValue * holding.weight, { style: 'full' })}</span></div>
}

export function FundPositionPopover({
  target,
  onMouseEnter,
  onMouseLeave,
}: {
  target: FundPositionPopoverTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  const { openCompleteHoldings } = useDashboardNavigation()
  const filters = useAtomValue(dashboardFiltersAtom)
  const { data: fundData } = useFundHoldingsData()
  const holdings = filters.dateTo
    ? selectHistoricalFundHoldingsAtDate(fundData?.history ?? EMPTY_HISTORICAL_FUND_HOLDINGS, filters.dateTo)
    : fundData?.holdings ?? EMPTY_FUND_HOLDINGS
  const { position, status } = target
  const rows = holdingsForPosition(position, holdings)
    .slice()
    .toSorted((a, b) => b.weight - a.weight)
    .slice(0, 8)
  const width = Math.min(560, window.innerWidth - 20)
  const estimatedHeight = Math.min(430, window.innerHeight - 20)
  const { top, left } = computeAllocationPopoverPosition(target.buttonRect, width, estimatedHeight)

  return createPortal(
    <div
      style={{ position: 'fixed', top, left, width, maxHeight: 'calc(100vh - 20px)', zIndex: 9999 }}
      className="overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{position.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-gray-600">{position.isin || position.ticker}</p>
        </div>
        <button type="button" onClick={() => openCompleteHoldings(position.name)} className="shrink-0 text-xs font-medium text-blue-400 hover:text-blue-300">

          {i18n.t('ui.fundpositionpopover.openAll')}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 border-b border-gray-800 pb-3 text-xs text-gray-500">
        <span>{status.sourceName}{status.proxyName ? i18n.t('ui.fundpositionpopover.exactProxyValue0', { value0: status.proxyName }) : ''}</span>
        <span>{i18n.t('ui.fundpositionpopover.holdings')} {status.holdingsDate || i18n.t('ui.fundpositionpopover.unknown')} · {formatNumber(status.holdingCount)}  {i18n.t('ui.fundpositionpopover.rows')}</span>
      </div>

      {rows.length > 0 ? (
        <div>
          {rows.map((holding) => <FundPositionHoldingRow key={holding.holdingId} holding={holding} position={position} />)}
        </div>
      ) : (
        <p className="py-5 text-center text-xs text-gray-500">{i18n.t('ui.fundpositionpopover.noUnderlyingHoldingsAvailable')}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
        <span>{formatPercentage(status.explainedPct)}  {i18n.t('ui.fundpositionpopover.explained')}{formatMoney(status.explainedValue, { style: 'full' })})</span>
        <span>{formatPercentage(status.residualPct)}  {i18n.t('ui.fundpositionpopover.undisclosed')}{formatMoney(status.residualValue, { style: 'full' })})</span>
        {status.issues && <span className="basis-full text-amber-300">{status.issues}</span>}
      </div>
    </div>,
    document.body,
  )
}

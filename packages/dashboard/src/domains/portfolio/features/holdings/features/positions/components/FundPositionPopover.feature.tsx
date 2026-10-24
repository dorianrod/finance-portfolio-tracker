import { createPortal } from 'react-dom'

import { useFundPositionHoldings } from '@/domains/portfolio/features/holdings/features/positions/services/useFundPositionHoldings'
import { computeAllocationPopoverPosition } from '@/domains/portfolio/shared/helpers/presenters/computeAllocationPopoverPosition'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

import { FundPositionHoldingRow } from './FundPositionHoldingRow.feature'

export type FundPositionPopoverTarget = {
  position: PositionRow
  status: FundHoldingStatus
  buttonRect: DOMRect
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
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  const { openCompleteHoldings } = useDashboardNavigation()
  const { position, status } = target
  const rows = useFundPositionHoldings(position)
  const width = Math.min(560, window.innerWidth - 20)
  const estimatedHeight = Math.min(430, window.innerHeight - 20)
  const { top, left } = computeAllocationPopoverPosition(
    target.buttonRect,
    width,
    estimatedHeight,
  )

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top,
        left,
        width,
        maxHeight: 'calc(100vh - 20px)',
        zIndex: 9999,
      }}
      className="overflow-y-auto rounded-xl border border-border-strong bg-surface p-4 shadow-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-content">
            {position.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-content-subtle">
            {position.isin || position.ticker}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCompleteHoldings(position.name)}
          className="shrink-0 text-xs font-medium text-accent hover:text-accent"
        >
          {i18n.t('ui.fundpositionpopover.openAll')}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 border-b border-border pb-3 text-xs text-content-subtle">
        <span>
          {status.sourceName}
          {status.proxyName
            ? i18n.t('ui.fundpositionpopover.exactProxyValue0', {
                value0: status.proxyName,
              })
            : ''}
        </span>
        <span>
          {i18n.t('ui.fundpositionpopover.holdings')}{' '}
          {status.holdingsDate
            ? formatDate(status.holdingsDate, { style: 'isoDate' })
            : i18n.t('ui.fundpositionpopover.unknown')}{' '}
          · {formatNumber(status.holdingCount)}{' '}
          {i18n.t('ui.fundpositionpopover.rows')}
        </span>
      </div>

      {rows.length > 0 ? (
        <div>
          {rows.map((holding) => (
            <FundPositionHoldingRow
              key={holding.holdingId}
              holding={holding}
              position={position}
            />
          ))}
        </div>
      ) : (
        <p className="py-5 text-center text-xs text-content-subtle">
          {i18n.t('ui.fundpositionpopover.noUnderlyingHoldingsAvailable')}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-subtle">
        <span>
          {formatPercentage(status.explainedPct)}{' '}
          {i18n.t('ui.fundpositionpopover.explained')}
          {formatMoney(status.explainedValue, { style: 'full' })})
        </span>
        <span>
          {formatPercentage(status.residualPct)}{' '}
          {i18n.t('ui.fundpositionpopover.undisclosed')}
          {formatMoney(status.residualValue, { style: 'full' })})
        </span>
        {status.issues && (
          <span className="basis-full text-warning">{status.issues}</span>
        )}
      </div>
    </div>,
    document.body,
  )
}

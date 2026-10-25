import { useFundPositionHoldings } from '@/domains/portfolio/features/holdings/features/positions/services/useFundPositionHoldings'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Preview } from '@/shared/ui/Preview.view'

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

  return (
    <Preview.Content
      anchor={target.buttonRect}
      label={target.position.name}
      style={{ width: `min(560px, calc(100vw - 20px))` }}
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
          {i18n.t('ui.fundpositionpopover.holdingsSummary', {
            count: status.holdingCount,
            formattedCount: formatNumber(status.holdingCount),
            date: status.holdingsDate
              ? formatDate(status.holdingsDate, { style: 'isoDate' })
              : i18n.t('ui.fundpositionpopover.unknown'),
          })}
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
          {i18n.t('ui.fundpositionpopover.explainedWithValues', {
            percentage: formatPercentage(status.explainedPct),
            amount: formatMoney(status.explainedValue, { style: 'full' }),
          })}
        </span>
        <span>
          {i18n.t('ui.fundpositionpopover.undisclosedWithValues', {
            percentage: formatPercentage(status.residualPct),
            amount: formatMoney(status.residualValue, { style: 'full' }),
          })}
        </span>
        {status.issues && (
          <span className="basis-full text-warning">{status.issues}</span>
        )}
      </div>
    </Preview.Content>
  )
}

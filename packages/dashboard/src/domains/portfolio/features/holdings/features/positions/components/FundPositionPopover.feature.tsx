import { useFundPositionHoldings } from '@/domains/portfolio/features/holdings/features/positions/services/useFundPositionHoldings'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'
import { useDashboardNavigation } from '@/domains/portfolio/shared/services/actions/useDashboardNavigation'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/Controls.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { FundPositionHoldingRow } from './FundPositionHoldingRow.feature'

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
      variant="floatingPanel"
      className="overflow-y-auto  p-4 "
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Text as="p" variant="bodyStrong" tone="default" truncate>
            {position.name}
          </Text>
          <Text
            as="p"
            variant="tinyCode"
            tone="subtle"
            truncate
            className="mt-0.5"
          >
            {position.isin || position.ticker}
          </Text>
        </div>
        <Button
          type="button"
          onClick={() => openCompleteHoldings(position.name)}
          variant="accentCaptionLink"
          className="shrink-0"
        >
          {i18n.t('ui.fundpositionpopover.openAll')}
        </Button>
      </div>

      <Surface
        variant="rowSeparator"
        tone="subtle"
        className="mb-3 flex flex-wrap gap-x-3 gap-y-1 pb-3"
      >
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
      </Surface>

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
        <Text
          as="p"
          variant="caption"
          tone="subtle"
          align="center"
          className="py-5"
        >
          {i18n.t('ui.fundpositionpopover.noUnderlyingHoldingsAvailable')}
        </Text>
      )}

      <Text
        as="div"
        variant="caption"
        tone="subtle"
        className="mt-3 flex flex-wrap gap-x-5 gap-y-1"
      >
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
          <Text tone="warning" className="basis-full">
            {status.issues}
          </Text>
        )}
      </Text>
    </Preview.Content>
  )
}

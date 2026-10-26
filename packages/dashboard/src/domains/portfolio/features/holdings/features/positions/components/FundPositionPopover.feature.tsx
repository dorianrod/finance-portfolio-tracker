import { useOpenCompleteHoldings } from '@/domains/portfolio/features/holdings/features/positions/services/actions/useOpenCompleteHoldings'
import { useFundPositionHoldings } from '@/domains/portfolio/features/holdings/features/positions/services/useFundPositionHoldings'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/controls/Button.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
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
  const openCompleteHoldings = useOpenCompleteHoldings()
  const { position, status } = target
  const rows = useFundPositionHoldings(position)

  return (
    <Preview.Content
      anchor={target.buttonRect}
      label={target.position.name}

      variant="floatingPanel"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      size="wide"
    >
      <Layout overflow="scroll" inset="default">
        <Inline as="div" spaceAfter="default" align="start" gap="default">
          <Layout sizing="flexible">
            <Text as="p" variant="bodyStrong" tone="default" truncate>
              {position.name}
            </Text>
            <Layout spaceBefore="compact">
              <Text as="p" variant="tinyCode" tone="subtle" truncate>
                {position.isin || position.ticker}
              </Text>
            </Layout>
          </Layout>
          <Layout as="span" flow="control" sizing="fixed">
            <Button
              type="button"
              onClick={() => openCompleteHoldings(position.name)}
              variant="accentCaptionLink"
            >
              {i18n.t('ui.fundpositionpopover.openAll')}
            </Button>
          </Layout>
        </Inline>

        <Layout spaceAfter="default">
          <Surface variant="rowSeparator" tone="subtle">
            <Inline as="div" flow="wrap" gap="compact" inset="default">
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
            </Inline>
          </Surface>
        </Layout>

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
          <Text as="p" variant="caption" tone="subtle" align="center">
            <Layout as="span" flow="block" inset="spacious">
              {i18n.t('ui.fundpositionpopover.noUnderlyingHoldingsAvailable')}
            </Layout>
          </Text>
        )}

        <Layout spaceBefore="default">
          <Text as="div" variant="caption" tone="subtle">
            <Inline as="div" flow="wrap" gap="compact">
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
                <Layout as="span" flow="inline">
                  <Text tone="warning">{status.issues}</Text>
                </Layout>
              )}
            </Inline>
          </Text>
        </Layout>
      </Layout>
    </Preview.Content>
  )
}

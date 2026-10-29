import type { Row } from '@tanstack/react-table'

import { shouldShowPositionQuantity } from '@/domains/portfolio/features/holdings/features/positions/helpers/businessRules/shouldShowPositionQuantity'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Value, quantity, purchase basis and cash variants implement the same table value column.
export function PositionValueCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney, formatNumber } = usePositionTableFormatters()

  const r = row.original
  if (r.kind === 'position') {
    const showQuantity = shouldShowPositionQuantity(r)
    return (
      <Text variant="compact">
        <Stack as="span">
          <Inline as="span" align="center" gap="compact">
            <Text
              variant={r.total_value == null ? undefined : 'medium'}
              tone={r.total_value == null ? 'subtle' : 'default'}
            >
              {formatMoney(r.total_value)}
            </Text>
          </Inline>
          {showQuantity && (
            <Layout as="span" flow="inline" spaceBefore="compact">
              <Text variant="tiny" tone="subtle">
                {formatNumber(r.quantity, {
                  maximumFractionDigits: 0,
                })}
                {r.last_price != null && (
                  <> · {formatMoney(r.last_price, { style: 'decimal' })}</>
                )}
              </Text>
            </Layout>
          )}
        </Stack>
      </Text>
    )
  }
  if (r.kind === 'group' && r.total_invested != null) {
    return (
      <Text variant="caption" tone="muted">
        <Stack as="span" gap="compact">
          <Text variant="annotation">
            {i18n.t('ui.positionstable.investedWithValues', {
              amount: formatMoney(r.total_invested),
            })}
          </Text>
          {r.avg_buy_price != null && (
            <Text tone="subtle">
              {i18n.t('ui.positionstable.avgPriceWithValues', {
                amount: formatMoney(r.avg_buy_price, {
                  style: 'decimal',
                }),
              })}
              <Layout as="span" flow="inline">
                <Text variant="quietFine">▲</Text>
              </Layout>
            </Text>
          )}
        </Stack>
      </Text>
    )
  }
  if (r.kind === 'group' && r.groupType === 'cash') {
    return (
      <Text variant="caption">
        <Stack as="span" gap="compact">
          <Text variant="accentAnnotation" tone="accent">
            {i18n.t('ui.positionstable.depositedWithValues', {
              amount: formatMoney(r.deposit_total, { fallback: 0 }),
            })}
          </Text>
          {(r.withdrawal_total ?? 0) > 0 && (
            <Text tone="negative">
              {i18n.t('ui.positionstable.withdrawnWithValues', {
                amount: formatMoney(r.withdrawal_total, {
                  fallback: 0,
                }),
              })}
            </Text>
          )}
        </Stack>
      </Text>
    )
  }
  if (r.kind === 'operation') {
    return (
      <Text variant="body" tone="secondary">
        {formatMoney(Math.abs(r.total_amount), { style: 'decimal' })}
      </Text>
    )
  }
  return null
}

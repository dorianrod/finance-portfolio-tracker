import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionGroupValue({
  group: r,
}: {
  group: Extract<TableRow, { kind: 'group' }>
}) {
  const { formatMoney } = usePositionTableFormatters()
  if (r.total_invested != null) {
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
  if (r.groupType === 'cash') {
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
  return null
}

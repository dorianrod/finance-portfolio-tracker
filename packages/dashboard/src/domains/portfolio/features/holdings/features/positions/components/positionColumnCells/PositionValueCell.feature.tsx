import type { Row } from '@tanstack/react-table'

import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import { shouldShowPositionQuantity } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/shouldShowPositionQuantity'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

import { PositionGroupValue } from './PositionGroupValue.view'

export function PositionValueCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney } = usePositionTableFormatters()

  const r = row.original
  if (r.kind === 'position') return <PositionMarketValue position={r} />
  if (r.kind === 'group') return <PositionGroupValue group={r} />
  if (r.kind === 'operation') {
    return (
      <Text variant="body" tone="secondary">
        {formatMoney(Math.abs(r.total_amount), { style: 'decimal' })}
      </Text>
    )
  }
  return null
}

function PositionMarketValue({
  position: r,
}: {
  position: Extract<TableRow, { kind: 'position' }>
}) {
  const { formatMoney, formatNumber } = usePositionTableFormatters()
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

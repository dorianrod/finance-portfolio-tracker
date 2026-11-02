import type { Row } from '@tanstack/react-table'

import { TransactionBadge } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableAppearance/TransactionBadge.view'
import { useFormatOperationGroupLabel } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/useFormatOperationGroupLabel'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionNameCell({ row }: { row: Row<TableRow> }) {
  const formatGroupLabel = useFormatOperationGroupLabel()

  const r = row.original
  if (r.kind === 'position') return <PositionIdentity position={r} />
  if (r.kind === 'group') {
    return (
      <Text variant="bodyStrong" tone="secondary">
        {formatGroupLabel(r.groupType)}
      </Text>
    )
  }
  if (r.kind === 'operation') return <OperationIdentity operation={r} />
  return null
}

function PositionIdentity({
  position: r,
}: {
  position: Extract<TableRow, { kind: 'position' }>
}) {
  const hasIdentifier = Boolean(r.ticker || r.isin)
  const showIdentifierSeparator = Boolean(r.isin && r.ticker)
  return (
    <Stack as="span" gap="compact">
      <Inline as="span" align="center" gap="default">
        <Text variant="medium" tone="default">
          {r.name}
        </Text>
        {r.status === 'closed' && (
          <Surface as="span" variant="highlightedChip" tone="muted">
            {i18n.t('ui.positionstable.closed')}
          </Surface>
        )}
      </Inline>
      {hasIdentifier && (
        <Inline as="span" align="center" gap="compact">
          {r.isin && (
            <Text variant="captionCode" tone="subtle">
              {r.isin}
            </Text>
          )}
          {showIdentifierSeparator && (
            <Text variant="caption" tone="subtle">
              ·
            </Text>
          )}
          {r.ticker && (
            <Text variant="captionCode" tone="muted">
              {r.ticker}
            </Text>
          )}
        </Inline>
      )}
    </Stack>
  )
}

function OperationIdentity({
  operation: r,
}: {
  operation: Extract<TableRow, { kind: 'operation' }>
}) {
  const { formatDate } = usePositionTableFormatters()
  let operationKind: 'buy' | 'sell' | 'other' = 'other'
  if (r.operation_type === 'BUY') operationKind = 'buy'
  else if (r.operation_type === 'SELL') operationKind = 'sell'
  return (
    <Text variant="body">
      <Inline as="span" align="center" gap="default">
        <TransactionBadge kind={operationKind}>
          {r.operation_type}
        </TransactionBadge>
        <Text tone="muted">{formatDate(r.date, { style: 'isoDate' })}</Text>
        <Text variant="caption" tone="subtle">
          {r.account}
        </Text>
      </Inline>
    </Text>
  )
}

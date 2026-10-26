import { type Row } from '@tanstack/react-table'

import { UnrealizedGainCell } from '@/domains/portfolio/features/holdings/features/positions/components/gainCells/UnrealizedGainCell.feature'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { Text } from '@/shared/ui/Text.view'

export function PositionUnrealizedCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney, formatNumber } = usePositionTableFormatters()

  const r = row.original
  if (r.kind === 'position') {
    return <UnrealizedGainCell position={r} />
  }
  if (r.kind === 'operation' && r.operation_type === 'BUY') {
    if (r.quantity == null) return null
    return (
      <Text variant="caption" tone="muted">
        {formatNumber(r.quantity, { maximumFractionDigits: 2 })} ×{' '}
        {formatMoney(r.price_per_unit, { style: 'decimal' })}
      </Text>
    )
  }
  return null
}

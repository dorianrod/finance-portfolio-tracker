import { type Row } from '@tanstack/react-table'

import { GainCell } from '@/domains/portfolio/features/holdings/features/positions/components/GainCell.view'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { Text } from '@/shared/ui/Text.view'

export function PositionTotalRealizedCell({ row }: { row: Row<TableRow> }) {
  const r = row.original
  if (r.kind === 'position') {
    return r.total_realized_return === 0 ? (
      <Text tone="subtle">—</Text>
    ) : (
      <GainCell value={r.total_realized_return} />
    )
  }
  return null
}

import type { Row } from '@tanstack/react-table'

import { GainCell } from '@/domains/portfolio/features/holdings/features/positions/components/GainCell.view'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function PositionTotalRealizedCell({ row }: { row: Row<TableRow> }) {
  const r = row.original
  if (r.kind === 'position') {
    return <GainCell value={r.total_realized_return} zeroAsFallback />
  }
  return null
}

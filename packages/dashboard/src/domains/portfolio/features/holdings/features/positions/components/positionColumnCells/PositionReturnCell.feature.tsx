import { type Row } from '@tanstack/react-table'

import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/presenters/getGainTone'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { Text } from '@/shared/ui/Text.view'

export function PositionReturnCell({ row }: { row: Row<TableRow> }) {
  const { formatPercentage } = usePositionTableFormatters()

  const r = row.original
  if (r.kind !== 'position' || r.total_return_pct == null) return null
  return (
    <Text tone={getGainTone(r.total_return_pct)}>
      {formatPercentage(r.total_return_pct, {
        decimals: 2,
        signed: true,
      })}
    </Text>
  )
}

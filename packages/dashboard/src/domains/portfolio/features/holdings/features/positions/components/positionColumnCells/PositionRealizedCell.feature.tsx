import type { Row } from '@tanstack/react-table'

import { GainCell } from '@/domains/portfolio/features/holdings/features/positions/components/GainCell.view'
import { RealizedGainCell } from '@/domains/portfolio/features/holdings/features/positions/components/gainCells/RealizedGainCell.feature'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionRealizedCell({ row }: { row: Row<TableRow> }) {
  const { formatMoney } = usePositionTableFormatters()

  const r = row.original
  if (r.kind === 'position') {
    return <RealizedGainCell position={r} />
  }
  if (r.kind === 'group' && r.groupType === 'trades') {
    return (
      <Text variant="caption">
        <Layout as="span" flow="inline">
          <Text tone="muted">
            {i18n.t('ui.positionstable.soldWithValues', {
              amount: formatMoney(r.total_sold, { fallback: 0 }),
            })}
          </Text>
          <GainCell value={r.realized_pnl ?? null} />
        </Layout>
      </Text>
    )
  }
  if (r.kind === 'operation' && r.realized_gain != null) {
    return <GainCell value={r.realized_gain} />
  }
  return null
}

import type { Row } from '@tanstack/react-table'

import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/presenters/getGainTone'
import { useFormatIrrPeriodLabel } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/useFormatIrrPeriodLabel'
import { usePositionTableFormatters } from '@/domains/portfolio/features/holdings/features/positions/helpers/formatters/usePositionTableFormatters'
import type { TableRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionIrrCell({ row }: { row: Row<TableRow> }) {
  const formatIrrPeriodLabel = useFormatIrrPeriodLabel()
  const { formatPercentage } = usePositionTableFormatters()

  const r = row.original
  if (r.kind !== 'position' || (r.xirr == null && r.xirr_rolling_3y == null))
    return null
  return (
    <Text variant="compact">
      <Stack as="span">
        {r.xirr != null && (
          <Text tone={getGainTone(r.xirr)}>
            {formatPercentage(r.xirr, { decimals: 2, signed: true })}
            <Layout as="span" flow="inline">
              <Text variant="subduedCaption">
                {i18n.t('ui.positionstable.yr.22ed45')}
              </Text>
            </Layout>
          </Text>
        )}
        <Layout as="span" flow="inline" spaceBefore="compact">
          <Text variant="tiny" tone="subtle">
            {formatIrrPeriodLabel(r.xirr_rolling_period_years)}:{' '}
            {formatPercentage(r.xirr_rolling_3y, {
              decimals: 2,
              signed: true,
              suffix: i18n.t('ui.positionstable.yr.22ed45'),
            })}
          </Text>
        </Layout>
      </Stack>
    </Text>
  )
}

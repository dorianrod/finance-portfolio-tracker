import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function FundPositionHoldingRow({
  holding,
  position,
}: {
  holding: FundHolding
  position: PositionRow
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const positionValue = position.total_value ?? 0
  return (
    <Surface variant="mutedRowSeparator">
      <Grid
        arrangement="labelTwoValues"
        align="baseline"
        gap="default"
        inset="tooltipRow"
      >
        <Text tone="secondary" truncate title={holding.holdingName}>
          {holding.holdingName}
        </Text>
        <Text tone="subtle" align="right" numeric>
          {formatPercentage(holding.weight * 100, { decimals: 2 })}
        </Text>
        <Text tone="muted" align="right" numeric>
          {formatMoney(positionValue * holding.weight, { style: 'full' })}
        </Text>
      </Grid>
    </Surface>
  )
}

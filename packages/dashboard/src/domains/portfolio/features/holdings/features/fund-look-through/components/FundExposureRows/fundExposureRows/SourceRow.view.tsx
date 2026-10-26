import { memo } from 'react'

import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export const SourceRow = memo(function SourceRow({
  fund,
  value,
}: {
  fund: string
  value: number
}) {
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="detailRow">
      <Grid arrangement="labelThreeValues">
        <span />
        <Text tone="subtle" align="right" numeric>
          {formatMoney(value, { style: 'full' })}
        </Text>
        <span />
        <Text tone="subtle" truncate title={fund}>
          {fund}
        </Text>
      </Grid>
    </Surface>
  )
})

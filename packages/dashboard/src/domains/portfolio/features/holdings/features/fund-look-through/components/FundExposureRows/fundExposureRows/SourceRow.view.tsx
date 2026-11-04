import { memo } from 'react'

import { useFormatExposureSourceLabel } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/formatters/useFormatExposureSourceLabel'
import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export const SourceRow = memo(function SourceRow({
  source,
}: {
  source: ExposureSource
}) {
  const formatMoney = useFormatMoney()
  const formatSourceLabel = useFormatExposureSourceLabel()
  const label = formatSourceLabel(source)
  return (
    <Surface variant="detailRow">
      <Grid
        arrangement="labelThreeValues"
        height="full"
        align="center"
        inset="tableRow"
      >
        <span />
        <Text tone="subtle" align="right" numeric>
          {formatMoney(source.value, { style: 'full' })}
        </Text>
        <span />
        <Text tone="subtle" truncate title={label}>
          {label}
        </Text>
      </Grid>
    </Surface>
  )
})

import type { RollingReturn } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { useFormatRollingReturnPeriod } from './helpers/formatters/useFormatRollingReturnPeriod'

export function RollingUnitPricePerf({ rows }: { rows: RollingReturn[] }) {
  if (rows.length === 0) return null
  return (
    <Layout spaceBefore="default">
      <Surface variant="strongSectionStart">
        <Stack inset="compact" gap="compact">
          {rows.map((row) => (
            <RollingUnitPriceRow key={row.period} row={row} />
          ))}
        </Stack>
      </Surface>
    </Layout>
  )
}

function RollingUnitPriceRow({ row }: { row: RollingReturn }) {
  const formatPercentage = useFormatPercentage()
  const formatPeriod = useFormatRollingReturnPeriod()
  return (
    <Text as="p" tone={row.pct >= 0 ? 'positive' : 'negative'}>
      {formatPeriod(row.period)}: {formatPercentage(row.pct, { signed: true })}
    </Text>
  )
}

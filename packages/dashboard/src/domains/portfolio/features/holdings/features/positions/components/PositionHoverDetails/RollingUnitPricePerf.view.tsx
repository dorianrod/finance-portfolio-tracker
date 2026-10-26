import type { RollingReturn } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Layout, Stack } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function RollingUnitPricePerf({ rows }: { rows: RollingReturn[] }) {
  if (rows.length === 0) return null
  return (
    <Layout spaceBefore="default">
      <Surface variant="strongSectionStart">
        <Stack inset="compact" gap="compact">
          {rows.map((row) => (
            <RollingUnitPriceRow key={row.label} row={row} />
          ))}
        </Stack>
      </Surface>
    </Layout>
  )
}

function RollingUnitPriceRow({ row }: { row: RollingReturn }) {
  const formatPercentage = useFormatPercentage()
  return (
    <Text as="p" tone={row.pct >= 0 ? 'positive' : 'negative'}>
      {row.label}: {formatPercentage(row.pct, { signed: true })}
    </Text>
  )
}

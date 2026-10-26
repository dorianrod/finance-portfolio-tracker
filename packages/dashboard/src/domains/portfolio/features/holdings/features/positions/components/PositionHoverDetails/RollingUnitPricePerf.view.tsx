import type { RollingReturn } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

function RollingUnitPriceRow({ row }: { row: RollingReturn }) {
  const formatPercentage = useFormatPercentage()
  return (
    <Text as="p" tone={row.pct >= 0 ? 'positive' : 'negative'}>
      {row.label}: {formatPercentage(row.pct, { signed: true })}
    </Text>
  )
}

export function RollingUnitPricePerf({ rows }: { rows: RollingReturn[] }) {
  if (rows.length === 0) return null
  return (
    <Surface variant="strongSectionStart" className="mt-2 pt-2 space-y-0.5">
      {rows.map((row) => (
        <RollingUnitPriceRow key={row.label} row={row} />
      ))}
    </Surface>
  )
}

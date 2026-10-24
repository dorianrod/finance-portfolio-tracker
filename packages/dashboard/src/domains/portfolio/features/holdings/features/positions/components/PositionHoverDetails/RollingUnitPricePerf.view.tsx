import type { RollingReturn } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

function RollingUnitPriceRow({ row }: { row: RollingReturn }) {
  const formatPercentage = useFormatPercentage()
  return (
    <p
      className={
        row.pct >= 0
          ? SEMANTIC_TEXT_CLASSES.performancePositive
          : SEMANTIC_TEXT_CLASSES.performanceNegative
      }
    >
      {row.label}: {formatPercentage(row.pct, { signed: true })}
    </p>
  )
}

export function RollingUnitPricePerf({ rows }: { rows: RollingReturn[] }) {
  if (rows.length === 0) return null
  return (
    <div className="mt-2 pt-2 border-t border-border-strong space-y-0.5">
      {rows.map((row) => (
        <RollingUnitPriceRow key={row.label} row={row} />
      ))}
    </div>
  )
}

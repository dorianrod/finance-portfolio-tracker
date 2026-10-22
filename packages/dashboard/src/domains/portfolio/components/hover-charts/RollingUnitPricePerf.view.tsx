import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import type { RollingReturn } from './hoverCharts.logic'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function RollingUnitPricePerf({ rows }: { rows: RollingReturn[] }) {
  const formatPercentage = useFormatPercentage()
  if (rows.length === 0) return null
  return (
    <div className="mt-2 pt-2 border-t border-gray-600 space-y-0.5">
      {rows.map((r) => (
        <p key={r.label} className={r.pct >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}>
          {r.label}: {formatPercentage(r.pct, { signed: true })}
        </p>
      ))}
    </div>
  )
}

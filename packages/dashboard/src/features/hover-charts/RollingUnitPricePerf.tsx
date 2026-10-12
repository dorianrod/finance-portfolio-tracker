import { computeRollingReturns } from './hoverCharts.logic'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'

export function RollingUnitPricePerf({ series, label }: { series: Array<{ date: string; 'Unit price': number }>; label: string }) {
  const rows = computeRollingReturns(series, label)
  if (rows.length === 0) return null
  return (
    <div className="mt-2 pt-2 border-t border-gray-600 space-y-0.5">
      {rows.map((r) => (
        <p key={r.label} className={r.pct >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}>
          {r.label}: {r.pct >= 0 ? '+' : ''}{r.pct.toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

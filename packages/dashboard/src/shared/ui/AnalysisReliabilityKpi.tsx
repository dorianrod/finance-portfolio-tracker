import { fmtFull } from '@/shared/format/money'
import { formatPercentage } from '@/shared/format/percentage'

export type AnalysisReliabilityTone = 'healthy' | 'warning' | 'critical' | 'unavailable'

const TONES: Record<AnalysisReliabilityTone, {
  dot: string
  status: string
  value: string
  label: string
}> = {
  healthy: {
    dot: 'bg-emerald-500',
    status: 'text-emerald-400',
    value: 'text-emerald-400',
    label: 'Reliable',
  },
  warning: {
    dot: 'bg-amber-500',
    status: 'text-amber-400',
    value: 'text-amber-400',
    label: 'Partial',
  },
  critical: {
    dot: 'bg-red-500',
    status: 'text-red-400',
    value: 'text-red-400',
    label: 'Review',
  },
  unavailable: {
    dot: 'bg-gray-500',
    status: 'text-gray-400',
    value: 'text-gray-400',
    label: 'Unavailable',
  },
}

export function AnalysisReliabilityKpi({
  percentage,
  amount,
  metricLabel,
  tone,
  tooltip,
}: {
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
  tooltip: string
}) {
  const safePercentage = percentage == null || !Number.isFinite(percentage)
    ? null
    : Math.max(0, Math.min(100, percentage))
  const styles = TONES[tone]
  const percentageLabel = safePercentage == null ? '—' : `${formatPercentage(safePercentage)}%`

  return (
    <aside
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
      aria-label={`Data reliability: ${styles.label}. ${percentageLabel} ${metricLabel}. Analysis base ${fmtFull(amount)}.`}
      title={tooltip}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Data reliability</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.status}`}>{styles.label}</span>
      </div>
      <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
      <div className="flex items-baseline gap-1.5">
        <span className={`text-sm font-semibold tabular-nums ${styles.value}`}>{percentageLabel}</span>
        <span className="text-[10px] text-gray-600">{metricLabel}</span>
      </div>
      <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold tabular-nums text-gray-300">{fmtFull(amount)}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-600">analysis base</span>
      </div>
    </aside>
  )
}

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
  onClick,
}: {
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
  tooltip: string
  onClick: () => void
}) {
  const safePercentage = percentage == null || !Number.isFinite(percentage)
    ? null
    : Math.max(0, Math.min(100, percentage))
  const styles = TONES[tone]
  const percentageLabel = safePercentage == null ? '—' : `${formatPercentage(safePercentage)}%`

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md text-left transition-colors hover:bg-gray-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
      aria-label={`Data reliability: ${styles.label}. ${percentageLabel} ${metricLabel}. Analysis base ${fmtFull(amount)}. Open the related Data quality section.`}
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
    </button>
  )
}

export function PipelineReliabilityKpi({
  errorCount,
  warningCount,
  loading = false,
  onClick,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
  onClick: () => void
}) {
  const tone: AnalysisReliabilityTone = loading
    ? 'unavailable'
    : errorCount > 0
      ? 'critical'
      : warningCount > 0
        ? 'warning'
        : 'healthy'
  const styles = TONES[tone]
  const issueCount = errorCount + warningCount
  const statusLabel = loading
    ? 'Loading'
    : issueCount === 0
      ? 'No anomaly'
      : `${issueCount} ${issueCount === 1 ? 'anomaly' : 'anomalies'}`

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md text-left transition-colors hover:bg-gray-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
      aria-label={`Data reliability: ${styles.label}. ${errorCount} errors and ${warningCount} warnings. Open the Pipeline section in Data quality.`}
      title="Pipeline anomalies relevant to the selected accounts and period. Severity determines the status: errors require review; warnings indicate partial reliability."
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Data reliability</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.status}`}>{styles.label}</span>
      </div>
      <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
      <span className={`text-sm font-semibold tabular-nums ${styles.value}`}>{statusLabel}</span>
      {!loading && issueCount > 0 && (
        <>
          <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
          <div className="flex items-center gap-2 text-[10px] font-medium">
            {errorCount > 0 && <span className="text-red-400">{errorCount} {errorCount === 1 ? 'error' : 'errors'}</span>}
            {warningCount > 0 && <span className="text-amber-400">{warningCount} {warningCount === 1 ? 'warning' : 'warnings'}</span>}
          </div>
        </>
      )}
    </button>
  )
}

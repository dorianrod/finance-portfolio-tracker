import { fmtFull } from '@/shared/format/money'
import { formatPercentage } from '@/shared/format/percentage'
import { hasMaterialQualityGap } from '@/shared/quality/qualityThresholds'

export type AnalysisReliabilityTone = 'healthy' | 'warning' | 'critical' | 'unavailable'

export interface AnalysisReliabilityMetric {
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
}

export interface StatusReliabilityMetric {
  value: string
  metricLabel: string
  tone: AnalysisReliabilityTone
}

const CRITICAL_RELIABILITY_PCT = 80

export function percentageReliabilityTone(percentage: number | null): AnalysisReliabilityTone {
  if (percentage == null || !Number.isFinite(percentage)) return 'unavailable'
  const safePercentage = Math.max(0, Math.min(100, percentage))
  if (!hasMaterialQualityGap(100 - safePercentage)) return 'healthy'
  return safePercentage < CRITICAL_RELIABILITY_PCT ? 'critical' : 'warning'
}

export function aggregateReliabilityTone(
  tones: AnalysisReliabilityTone[],
): AnalysisReliabilityTone {
  if (tones.every((tone) => tone === 'unavailable')) return 'unavailable'
  if (tones.includes('critical')) return 'critical'
  if (tones.some((tone) => tone === 'warning' || tone === 'unavailable')) return 'warning'
  return 'healthy'
}

export function pipelineReliabilityTone({
  errorCount,
  warningCount,
  loading = false,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
}): AnalysisReliabilityTone {
  if (loading) return 'unavailable'
  if (errorCount > 0) return 'critical'
  if (warningCount > 0) return 'warning'
  return 'healthy'
}

export function pipelineStatusLabel({
  errorCount,
  warningCount,
  loading = false,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
}): string {
  if (loading) return 'Loading'
  const issueCount = errorCount + warningCount
  if (issueCount === 0) return 'No anomaly'
  return `${issueCount} ${issueCount === 1 ? 'anomaly' : 'anomalies'}`
}

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
      aria-label={`Data reliability: ${styles.label}. ${percentageLabel} ${metricLabel}, ${fmtFull(amount)} analyzed. Open the related Data quality section.`}
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
        <span className="text-[10px] text-gray-600" aria-hidden="true">·</span>
        <span className="text-[10px] tabular-nums text-gray-400">{fmtFull(amount)}</span>
      </div>
    </button>
  )
}

export function CombinedAnalysisReliabilityKpi({
  metrics,
  statusMetric,
  tone,
  tooltip,
  onClick,
}: {
  metrics: AnalysisReliabilityMetric[]
  statusMetric?: StatusReliabilityMetric
  tone: AnalysisReliabilityTone
  tooltip: string
  onClick: () => void
}) {
  const styles = TONES[tone]
  const normalizedMetrics = metrics.map((metric) => ({
    ...metric,
    percentage: metric.percentage == null || !Number.isFinite(metric.percentage)
      ? null
      : Math.max(0, Math.min(100, metric.percentage)),
  }))
  const metricSummary = normalizedMetrics
    .map((metric) => `${metric.percentage == null ? 'unavailable' : `${formatPercentage(metric.percentage)}%`} ${metric.metricLabel}, ${fmtFull(metric.amount)} analyzed`)
    .join('; ')
  const statusMetricSummary = statusMetric
    ? `${statusMetric.value} ${statusMetric.metricLabel}; `
    : ''

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md text-left transition-colors hover:bg-gray-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
      aria-label={`Data reliability: ${styles.label}. ${statusMetricSummary}${metricSummary}. Open the most relevant Data quality section.`}
      title={tooltip}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Data reliability</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.status}`}>{styles.label}</span>
      </div>
      {statusMetric && (
        <div className="flex items-center gap-3">
          <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-semibold tabular-nums ${TONES[statusMetric.tone].value}`}>
              {statusMetric.value}
            </span>
            <span className="text-[10px] text-gray-600">{statusMetric.metricLabel}</span>
          </div>
        </div>
      )}
      {normalizedMetrics.map((metric) => (
        <div key={metric.metricLabel} className="flex items-center gap-3">
          <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-semibold tabular-nums ${TONES[metric.tone].value}`}>
              {metric.percentage == null ? '—' : `${formatPercentage(metric.percentage)}%`}
            </span>
            <span className="text-[10px] text-gray-600">{metric.metricLabel}</span>
            <span className="text-[10px] text-gray-600" aria-hidden="true">·</span>
            <span className="text-[10px] tabular-nums text-gray-400">{fmtFull(metric.amount)}</span>
          </div>
        </div>
      ))}
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
  const tone = pipelineReliabilityTone({ errorCount, warningCount, loading })
  const styles = TONES[tone]
  const issueCount = errorCount + warningCount
  const statusLabel = pipelineStatusLabel({ errorCount, warningCount, loading })
  const statusValueClass = !loading && issueCount === 0
    ? 'text-[10px] font-normal text-gray-600'
    : `text-sm font-semibold ${loading ? 'text-gray-400' : styles.value}`

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md text-left transition-colors hover:bg-gray-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
      aria-label={`Data reliability: ${styles.label}. ${errorCount} errors and ${warningCount} warnings in Portfolio data. Open the related Data quality section.`}
      title="Import, position and market-data anomalies relevant to the selected accounts and period. Severity determines the status: errors require review; warnings indicate partial reliability."
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Data reliability</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.status}`}>{styles.label}</span>
      </div>
      <span className="hidden h-4 w-px bg-gray-800 sm:block" aria-hidden="true" />
      <div className="flex items-baseline gap-1.5">
        <span className={`tabular-nums ${statusValueClass}`}>{statusLabel}</span>
        <span className="text-[10px] text-gray-600">Portfolio data</span>
      </div>
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

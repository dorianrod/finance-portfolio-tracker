import { useId } from 'react'
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

interface QualityTooltipRow {
  label: string
  value: string
  secondary?: string
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

const RELIABILITY_TONES: Record<AnalysisReliabilityTone, {
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

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path
        d="M2.5 10s2.6-4 7.5-4 7.5 4 7.5 4-2.6 4-7.5 4-7.5-4-7.5-4Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="1.75" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  )
}

function CompactDataQualityKpi({
  tone,
  tooltip,
  rows,
  ariaLabel,
  onClick,
}: {
  tone: AnalysisReliabilityTone
  tooltip: string
  rows: QualityTooltipRow[]
  ariaLabel: string
  onClick: () => void
}) {
  const tooltipId = useId()
  const styles = RELIABILITY_TONES[tone]

  return (
    <div className="data-quality-kpi inline-flex items-center rounded-md transition-colors hover:bg-gray-900/60">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-l-md py-1 pl-0 pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
        aria-label={ariaLabel}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Data quality</span>
        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.status}`}>{styles.label}</span>
      </button>
      <button
        type="button"
        className="data-quality-help relative rounded-r-md p-1 text-gray-600 transition-colors hover:text-gray-400 focus-visible:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
        aria-label="Show data quality details"
        aria-describedby={tooltipId}
      >
        <EyeIcon />
        <span
          id={tooltipId}
          role="tooltip"
          className="data-quality-tooltip pointer-events-none invisible absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-gray-700 bg-gray-900 p-3 text-left opacity-0 shadow-xl transition-[opacity,visibility] duration-150"
        >
          <span className="block text-xs leading-relaxed text-gray-400">{tooltip}</span>
          <span className="mt-3 block border-t border-gray-800 pt-1">
            {rows.map((row) => {
              const rowStyles = RELIABILITY_TONES[row.tone]
              return (
                <span key={row.label} className="flex items-center justify-between gap-4 py-1.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${rowStyles.dot}`} aria-hidden="true" />
                    <span className="text-[11px] text-gray-300">{row.label}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`block text-xs font-semibold tabular-nums ${rowStyles.value}`}>{row.value}</span>
                    {row.secondary && <span className="mt-0.5 block text-[10px] tabular-nums text-gray-500">{row.secondary}</span>}
                  </span>
                </span>
              )
            })}
          </span>
        </span>
      </button>
    </div>
  )
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
  const styles = RELIABILITY_TONES[tone]
  const percentageLabel = safePercentage == null ? '—' : `${formatPercentage(safePercentage)}%`

  return (
    <CompactDataQualityKpi
      tone={tone}
      tooltip={tooltip}
      rows={[{
        label: metricLabel,
        value: percentageLabel,
        secondary: `${fmtFull(amount)} analyzed`,
        tone,
      }]}
      onClick={onClick}
      ariaLabel={`Data quality: ${styles.label}. ${percentageLabel} ${metricLabel}. Open Data quality.`}
    />
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
  const styles = RELIABILITY_TONES[tone]
  const rows: QualityTooltipRow[] = [
    ...(statusMetric ? [{
      label: statusMetric.metricLabel,
      value: statusMetric.value,
      tone: statusMetric.tone,
    }] : []),
    ...metrics.map((metric) => ({
      label: metric.metricLabel,
      value: metric.percentage == null || !Number.isFinite(metric.percentage)
        ? '—'
        : `${formatPercentage(Math.max(0, Math.min(100, metric.percentage)))}%`,
      secondary: `${fmtFull(metric.amount)} analyzed`,
      tone: metric.tone,
    })),
  ]
  const metricSummary = rows.map((row) => `${row.value} ${row.label}`).join('; ')

  return (
    <CompactDataQualityKpi
      tone={tone}
      tooltip={tooltip}
      rows={rows}
      onClick={onClick}
      ariaLabel={`Data quality: ${styles.label}. ${metricSummary}. Open Data quality.`}
    />
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
  const styles = RELIABILITY_TONES[tone]
  const statusLabel = pipelineStatusLabel({ errorCount, warningCount, loading })

  return (
    <CompactDataQualityKpi
      tone={tone}
      tooltip="Import, position and market-data anomalies relevant to the selected accounts and period. Severity determines the status: errors require review; warnings indicate partial reliability."
      rows={[{
        label: 'Portfolio data',
        value: statusLabel,
        secondary: loading ? undefined : `${errorCount} errors · ${warningCount} warnings`,
        tone,
      }]}
      onClick={onClick}
      ariaLabel={`Data quality: ${styles.label}. ${errorCount} errors and ${warningCount} warnings in Portfolio data. Open Data quality.`}
    />
  )
}

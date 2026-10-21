import { useId } from 'react'
import { fmtFull } from '@/shared/format/money'
import { formatPercentage } from '@/shared/format/percentage'
import {
  pipelineReliabilityTone,
  pipelineStatusLabel,
  type AnalysisReliabilityTone,
} from '@/shared/quality/analysisReliability'
import { FilterScopeBadges, type FilterScopeSpec } from '@/shared/ui/FilterScopeBadges'

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

function InfoIcon() {
  return <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-600 text-[10px] font-bold leading-none">i</span>
}

function CompactDataQualityKpi({
  tone,
  tooltip,
  rows,
  ariaLabel,
  onClick,
  scope,
}: {
  tone: AnalysisReliabilityTone
  tooltip: string
  rows: QualityTooltipRow[]
  ariaLabel: string
  onClick: () => void
  scope: FilterScopeSpec
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
        <InfoIcon />
        <span
          id={tooltipId}
          role="tooltip"
          className="data-quality-tooltip pointer-events-none invisible absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-gray-700 bg-gray-900 p-3 text-left opacity-0 shadow-xl transition-[opacity,visibility] duration-150"
        >
          <span className="block text-xs leading-relaxed text-gray-400">{tooltip}</span>
          <span className="mt-2.5 block border-t border-gray-800 pt-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Filter scope</span>
            <FilterScopeBadges {...scope} />
          </span>
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
  scope,
}: {
  percentage: number | null
  amount: number
  metricLabel: string
  tone: AnalysisReliabilityTone
  tooltip: string
  onClick: () => void
  scope: FilterScopeSpec
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
      scope={scope}
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
  scope,
}: {
  metrics: AnalysisReliabilityMetric[]
  statusMetric?: StatusReliabilityMetric
  tone: AnalysisReliabilityTone
  tooltip: string
  onClick: () => void
  scope: FilterScopeSpec
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
      scope={scope}
      ariaLabel={`Data quality: ${styles.label}. ${metricSummary}. Open Data quality.`}
    />
  )
}

export function PipelineReliabilityKpi({
  errorCount,
  warningCount,
  loading = false,
  onClick,
  scope,
}: {
  errorCount: number
  warningCount: number
  loading?: boolean
  onClick: () => void
  scope: FilterScopeSpec
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
      scope={scope}
      ariaLabel={`Data quality: ${styles.label}. ${errorCount} errors and ${warningCount} warnings in Portfolio data. Open Data quality.`}
    />
  )
}

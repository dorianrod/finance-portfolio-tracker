import { getConcentrationTone } from '@/domains/portfolio/features/overview/helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from '@/domains/portfolio/features/overview/helpers/presenters/getOverviewPerformanceTone'
import type { ComparedMetric } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

export function DeltaBadge({
  metric,
  tone = 'performance',
}: {
  metric: ComparedMetric
  tone?: 'performance' | 'contributions' | 'concentration'
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  let color = getOverviewPerformanceTone(metric.delta)
  if (tone === 'contributions') color = SEMANTIC_TEXT_CLASSES.netContributions
  else if (tone === 'concentration') color = getConcentrationTone(metric.delta)
  let label =
    metric.delta == null ? '—' : `${metric.delta > 0 ? '+' : ''}${formatMoney(metric.delta)}`
  if (tone === 'concentration') {
    label =
      metric.delta == null ? '—' : formatPercentage(metric.delta, { signed: true, unit: ' pp' })
  }
  const deltaPercentage =
    tone !== 'concentration' && metric.deltaPct != null ? metric.deltaPct : null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-canvas/55 px-2 py-1 text-[11px] font-semibold tabular-nums ${color}`}
    >
      {label}
      {deltaPercentage != null && (
        <span className="font-medium opacity-75">
          · {formatPercentage(deltaPercentage, { signed: true })}
        </span>
      )}
    </span>
  )
}

export function PreviousValue({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  const formatMoney = useFormatMoney()
  return (
    <span className="text-[11px] text-content-subtle">
      {i18n.t('ui.overviewsummarycards.previous')}{' '}
      <span className="font-medium tabular-nums text-content-muted">
        {value == null
          ? i18n.t('ui.overviewsummarycards.unavailable')
          : `${formatMoney(value)}${suffix}`}
      </span>
    </span>
  )
}

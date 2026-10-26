import type { ComparedMetric } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { getConcentrationTone } from '@/domains/portfolio/features/overview/helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from '@/domains/portfolio/features/overview/helpers/presenters/getOverviewPerformanceTone'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { MetricDelta } from '@/shared/ui/badge/MetricDelta.view'

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
  if (tone === 'contributions') color = 'accent'
  else if (tone === 'concentration') color = getConcentrationTone(metric.delta)
  let label =
    metric.delta == null
      ? '—'
      : `${metric.delta > 0 ? '+' : ''}${formatMoney(metric.delta)}`
  if (tone === 'concentration') {
    label = formatPercentage(metric.delta, { signed: true, unit: ' pp' })
  }
  const deltaPercentage =
    tone !== 'concentration' && metric.deltaPct != null ? metric.deltaPct : null
  return (
    <MetricDelta tone={color}>
      {label}
      {deltaPercentage != null && (
        <MetricDelta.Detail>
          · {formatPercentage(deltaPercentage, { signed: true })}
        </MetricDelta.Detail>
      )}
    </MetricDelta>
  )
}

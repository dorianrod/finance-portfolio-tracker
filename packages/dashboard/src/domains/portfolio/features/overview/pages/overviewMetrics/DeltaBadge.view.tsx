import type { ComparedMetric } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { getConcentrationTone } from '@/domains/portfolio/features/overview/pages/helpers/presenters/getConcentrationTone'
import { getOverviewPerformanceTone } from '@/domains/portfolio/features/overview/pages/helpers/presenters/getOverviewPerformanceTone'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { MetricDelta } from '@/shared/ui/badge/MetricDelta.view'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { Text } from '@/shared/ui/Text.view'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

export function DeltaBadge({
  metric,
  tone = 'performance',
}: {
  metric: ComparedMetric
  tone?: 'performance' | 'concentration'
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const color =
    tone === 'concentration'
      ? getConcentrationTone(metric.delta)
      : getOverviewPerformanceTone(metric.delta)
  let label = formatMoney(metric.delta, { signed: true })
  if (tone === 'concentration') {
    label = formatPercentage(metric.delta, { signed: true, unit: ' pp' })
  }
  const deltaPercentage =
    tone !== 'concentration' && metric.deltaPct != null ? metric.deltaPct : null
  return (
    <MetricDelta tone={color}>
      <TrendArrow value={metric.delta} tone={color} />
      <Text wrap="nowrap">{label}</Text>
      {deltaPercentage != null && (
        <MetricDelta.Detail>
          · {formatPercentage(deltaPercentage, { signed: true })}
        </MetricDelta.Detail>
      )}
    </MetricDelta>
  )
}

function TrendArrow({ value, tone }: { value: number | null; tone: TextTone }) {
  if (value == null || value === 0) return null
  return (
    <Decorative tone={tone} variant="bodyStrong">
      {value > 0 ? '↗' : '↘'}
    </Decorative>
  )
}

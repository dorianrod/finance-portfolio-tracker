import { formatConcentrationDelta } from '@/domains/portfolio/features/allocation/features/concentration/helpers/formatters/formatConcentrationDelta'
import { formatPositionCount } from '@/domains/portfolio/features/allocation/features/concentration/helpers/formatters/formatPositionCount'
import { type ConcentrationChartRow } from '@/domains/portfolio/features/allocation/features/concentration/services/useConcentrationTrendController'
import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { SemanticColorKey } from '@/shared/theme/semanticColors'
import { ChartText } from '@/shared/ui/ChartText.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export type TrendTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: ConcentrationChartRow }>
}

export type HoldingTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HistoricalConcentrationHolding }>
}

export function ThresholdRow({
  label,
  tone,
  value,
  delta,
}: {
  label: string
  tone: SemanticColorKey
  value: number | null
  delta: number | null
}) {
  const formatNumber = useFormatNumber()
  return (
    <div>
      <ChartText tone={tone}>{label}</ChartText> {formatPositionCount(value)}{' '}
      <Text tone="subtle">
        ·{' '}
        {value == null
          ? i18n.t(
              'ui.concentrationtrendsection.insufficientIdentifiedCoverage',
            )
          : formatConcentrationDelta(delta, formatNumber)}
      </Text>
    </div>
  )
}

export function ConcentrationTrendTooltip({
  active,
  payload,
}: TrendTooltipProps) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <TooltipBox minWidth={250}>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {formatDate(row.date, { style: 'shortMonthShortYear' })}
      </ChartText>
      <ChartText
        as="div"
        tone={'tooltipDim'}
        variant="caption"
        className="mt-1"
      >
        {i18n.t('ui.concentrationtrendsection.coverageWithValues', {
          percentage: formatPercentage(row.coveragePct),
        })}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'} className="mt-2 space-y-1">
        <ThresholdRow
          label="25%"
          tone={'risk'}
          value={row.positionsTo25Pct}
          delta={row.positionsTo25Delta}
        />
        <ThresholdRow
          label="50%"
          tone={'totalChange'}
          value={row.positionsTo50Pct}
          delta={row.positionsTo50Delta}
        />
        <ThresholdRow
          label="75%"
          tone={'netContributions'}
          value={row.positionsTo75Pct}
          delta={row.positionsTo75Delta}
        />
        <ThresholdRow
          label="90%"
          tone={'portfolioValue'}
          value={row.positionsTo90Pct}
          delta={row.positionsTo90Delta}
        />
      </ChartText>
    </TooltipBox>
  )
}

export function HistoricalHoldingTooltip({
  active,
  payload,
}: HoldingTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const holding = payload[0].payload
  return (
    <TooltipBox minWidth={200}>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {holding.name}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'} className="mt-1">
        {formatMoney(holding.value, { style: 'full' })} ·{' '}
        {formatPercentage(holding.weight)}
      </ChartText>
    </TooltipBox>
  )
}

export function ChartLegend() {
  return (
    <Text
      as="div"
      variant="micro"
      tone="subtle"
      className="mb-3 flex flex-wrap gap-4"
    >
      {(
        [
          ['25%', 'risk'],
          ['50%', 'totalChange'],
          ['75%', 'netContributions'],
          ['90%', 'portfolioValue'],
        ] as const
      ).map(([label, tone]) => (
        <ChartLegendItem key={label} label={label} tone={tone} />
      ))}
    </Text>
  )
}

export function ChartLegendItem({
  tone,
  label,
}: {
  tone: SemanticColorKey
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <SeriesSwatch shape="softDot" tone={tone} className="h-0.5 w-3" />
      {label}
    </span>
  )
}

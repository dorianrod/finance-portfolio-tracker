import { formatConcentrationDelta } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/formatConcentrationDelta'
import { formatPositionCount } from '@/domains/portfolio/features/diversification/features/concentration/helpers/formatters/formatPositionCount'
import { type ConcentrationChartRow } from '@/domains/portfolio/features/diversification/features/concentration/services/useConcentrationTrendController'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { ChartTone } from '@/shared/theme/chartColors'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Inline, Layout, Stack } from '@/shared/ui/Layout.view'
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
  tone: ChartTone
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
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {formatDate(row.date, { style: 'shortMonthShortYear' })}
      </ChartText>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipDim'} variant="caption">
          {i18n.t('ui.concentrationtrendsection.coverageWithValues', {
            percentage: formatPercentage(row.coveragePct),
          })}
        </ChartText>
      </Layout>
      <Layout spaceBefore="default">
        <ChartText as="div" tone={'tooltipLabel'}>
          <Stack gap="compact">
            <ThresholdRow
              label="25%"
              tone={PORTFOLIO_CHART_TONES.risk}
              value={row.positionsTo25Pct}
              delta={row.positionsTo25Delta}
            />
            <ThresholdRow
              label="50%"
              tone={PORTFOLIO_CHART_TONES.totalChange}
              value={row.positionsTo50Pct}
              delta={row.positionsTo50Delta}
            />
            <ThresholdRow
              label="75%"
              tone={PORTFOLIO_CHART_TONES.netContributions}
              value={row.positionsTo75Pct}
              delta={row.positionsTo75Delta}
            />
            <ThresholdRow
              label="90%"
              tone={PORTFOLIO_CHART_TONES.portfolioValue}
              value={row.positionsTo90Pct}
              delta={row.positionsTo90Delta}
            />
          </Stack>
        </ChartText>
      </Layout>
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
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {holding.name}
      </ChartText>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipLabel'}>
          {formatMoney(holding.value, { style: 'full' })} ·{' '}
          {formatPercentage(holding.weight)}
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}

export function ChartLegend() {
  return (
    <Layout spaceAfter="default">
      <Text as="div" variant="micro" tone="subtle">
        <Inline as="div" flow="wrap" gap="relaxed">
          {(
            [
              ['25%', PORTFOLIO_CHART_TONES.risk],
              ['50%', PORTFOLIO_CHART_TONES.totalChange],
              ['75%', PORTFOLIO_CHART_TONES.netContributions],
              ['90%', PORTFOLIO_CHART_TONES.portfolioValue],
            ] as const
          ).map(([label, tone]) => (
            <ChartLegendItem key={label} label={label} tone={tone} />
          ))}
        </Inline>
      </Text>
    </Layout>
  )
}

export function ChartLegendItem({
  tone,
  label,
}: {
  tone: ChartTone
  label: string
}) {
  return (
    <Inline as="span" align="center" gap="compact">
      <Layout as="span" flow="inline" height="divider" width="icon">
        <SeriesSwatch shape="softDot" tone={tone} />
      </Layout>
      {label}
    </Inline>
  )
}

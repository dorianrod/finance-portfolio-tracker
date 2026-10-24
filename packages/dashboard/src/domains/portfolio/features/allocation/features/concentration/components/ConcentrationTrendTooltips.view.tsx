import { formatConcentrationDelta } from '@/domains/portfolio/features/allocation/features/concentration/helpers/formatters/formatConcentrationDelta'
import { formatPositionCount } from '@/domains/portfolio/features/allocation/features/concentration/helpers/formatters/formatPositionCount'
import { type ConcentrationChartRow } from '@/domains/portfolio/features/allocation/features/concentration/services/useConcentrationTrendController'
import type { HistoricalConcentrationHolding } from '@/domains/portfolio/shared/helpers/calculators/buildConcentrationTrend'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
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
  color,
  value,
  delta,
}: {
  label: string
  color: string
  value: number | null
  delta: number | null
}) {
  const formatNumber = useFormatNumber()
  return (
    <div>
      <span style={{ color }}>{label}</span> {formatPositionCount(value)}{' '}
      <span className="text-content-subtle">
        ·{' '}
        {value == null
          ? i18n.t(
              'ui.concentrationtrendsection.insufficientIdentifiedCoverage',
            )
          : formatConcentrationDelta(delta, formatNumber)}
      </span>
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
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        {formatDate(row.date, { style: 'shortMonthShortYear' })}
      </div>
      <div className="mt-1 text-xs" style={{ color: 'var(--tooltip-dim)' }}>
        {i18n.t('ui.concentrationtrendsection.coverage')}{' '}
        {formatPercentage(row.coveragePct)}
      </div>
      <div className="mt-2 space-y-1" style={{ color: 'var(--tooltip-label)' }}>
        <ThresholdRow
          label="25%"
          color={SEMANTIC_COLORS.risk}
          value={row.positionsTo25Pct}
          delta={row.positionsTo25Delta}
        />
        <ThresholdRow
          label="50%"
          color={SEMANTIC_COLORS.totalChange}
          value={row.positionsTo50Pct}
          delta={row.positionsTo50Delta}
        />
        <ThresholdRow
          label="75%"
          color={SEMANTIC_COLORS.netContributions}
          value={row.positionsTo75Pct}
          delta={row.positionsTo75Delta}
        />
        <ThresholdRow
          label="90%"
          color={SEMANTIC_COLORS.portfolioValue}
          value={row.positionsTo90Pct}
          delta={row.positionsTo90Delta}
        />
      </div>
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
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        {holding.name}
      </div>
      <div className="mt-1" style={{ color: 'var(--tooltip-label)' }}>
        {formatMoney(holding.value, { style: 'full' })} ·{' '}
        {formatPercentage(holding.weight)}
      </div>
    </TooltipBox>
  )
}

export function ChartLegend() {
  return (
    <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-content-subtle">
      {[
        ['25%', SEMANTIC_COLORS.risk],
        ['50%', SEMANTIC_COLORS.totalChange],
        ['75%', SEMANTIC_COLORS.netContributions],
        ['90%', SEMANTIC_COLORS.portfolioValue],
      ].map(([label, color]) => (
        <ChartLegendItem key={label} label={label} color={color} />
      ))}
    </div>
  )
}

export function ChartLegendItem({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-0.5 w-3 rounded" style={{ background: color }} />
      {label}
    </span>
  )
}

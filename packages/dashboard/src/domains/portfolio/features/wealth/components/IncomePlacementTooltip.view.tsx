import { type LabelProps } from 'recharts'

import type { YearLabelPlacement } from '@/domains/portfolio/features/wealth/helpers/calculators/calculateYearLabelLayout'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

const DEFAULT_YEAR_LABEL_PLACEMENT: YearLabelPlacement = {
  dx: 0,
  dy: -12,
  textAnchor: 'middle',
}

export function YearLabel({
  index,
  value,
  viewBox,
  placements,
  chartPoints,
  recentYears,
  oldestYear,
  newestYear,
}: LabelProps & {
  placements: YearLabelPlacement[]
  chartPoints: AnnualIncomeSavingsPoint[]
  recentYears: Set<number>
  oldestYear: number
  newestYear: number
}) {
  if (index == null || !viewBox || !('x' in viewBox) || !('y' in viewBox))
    return null
  const placement = placements[index] ?? DEFAULT_YEAR_LABEL_PLACEMENT
  const point = chartPoints[index]
  if (!point) return null

  const width = 'width' in viewBox ? Number(viewBox.width ?? 0) : 0
  const height = 'height' in viewBox ? Number(viewBox.height ?? 0) : 0
  const x = Number(viewBox.x) + width / 2 + placement.dx
  const y = Number(viewBox.y) + height / 2 + placement.dy
  const isRecent = recentYears.has(point.year)
  const ageProgress =
    (point.year - oldestYear) / Math.max(1, newestYear - oldestYear)
  const opacity = isRecent ? 1 : 0.3 + ageProgress * 0.35

  return (
    <text
      x={x}
      y={y}
      textAnchor={placement.textAnchor}
      fill={
        isRecent ? SEMANTIC_COLORS.returnRate : SEMANTIC_COLORS.neutralSeries
      }
      fillOpacity={opacity}
      fontSize={11}
      fontWeight={isRecent ? 600 : 400}
      pointerEvents="none"
    >
      {value}
    </text>
  )
}

export function RelationshipTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: AnnualIncomeSavingsPoint }>
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <TooltipBox minWidth={220}>
      <div
        style={{
          color: 'var(--tooltip-text)',
          fontWeight: 600,
          marginBottom: 7,
        }}
      >
        {point.year}
      </div>
      <div style={{ color: 'var(--tooltip-label)' }}>
        {i18n.t('ui.incomeplacementrelationshipchart.totalNetIncome')}{' '}
        {formatMoney(point.totalIncome, { style: 'full' })}
      </div>
      <div style={{ color: SEMANTIC_COLORS.costBasisText }}>
        {i18n.t('ui.incomeplacementrelationshipchart.netSalary')}{' '}
        {formatMoney(point.netSalary, { style: 'full' })}
      </div>
      <div style={{ color: SEMANTIC_COLORS.passiveIncomeSecondary }}>
        {i18n.t('ui.incomeplacementrelationshipchart.otherIncome')}{' '}
        {formatMoney(point.otherIncome, { style: 'full' })}
      </div>
      <div
        style={{ color: SEMANTIC_COLORS.netContributionsText, marginTop: 6 }}
      >
        {i18n.t('ui.incomeplacementrelationshipchart.netContributions')}{' '}
        {formatMoney(point.placedSavings ?? 0, { style: 'full' })}
      </div>
      <div style={{ color: SEMANTIC_COLORS.returnRate }}>
        {i18n.t('ui.incomeplacementrelationshipchart.placementRate')}{' '}
        {formatPercentage(point.placementRate ?? 0)}
      </div>
      <div style={{ color: 'var(--tooltip-dim)', marginTop: 6 }}>
        {i18n.t('ui.incomeplacementrelationshipchart.unplacedIncomeProxy')}{' '}
        {formatMoney(point.unplacedIncomeProxy ?? 0, { style: 'full' })}
      </div>
    </TooltipBox>
  )
}

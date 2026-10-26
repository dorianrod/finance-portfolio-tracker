import { type LabelProps } from 'recharts'

import type { YearLabelPlacement } from '@/domains/portfolio/features/wealth/helpers/calculators/calculateYearLabelLayout'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartLabel } from '@/shared/ui/ChartLabel.view'
import { ChartText } from '@/shared/ui/ChartText.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { getYearLabelPosition } from './helpers/presenters/getYearLabelPosition'

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

  const { x, y } = getYearLabelPosition(viewBox, placement)
  const isRecent = recentYears.has(point.year)

  return (
    <ChartLabel
      x={x}
      y={y}
      align={placement.textAnchor}
      tone={isRecent ? 'returnRate' : 'neutralSeries'}
      age={{ year: point.year, recent: isRecent, oldestYear, newestYear }}
    >
      {value}
    </ChartLabel>
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
      <ChartText
        as="div"
        tone={'tooltipText'}
        variant="strong"
        style={{ marginBottom: 7 }}
      >
        {point.year}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'}>
        {i18n.t(
          'ui.incomeplacementrelationshipchart.totalNetIncomeWithValues',
          { amount: formatMoney(point.totalIncome, { style: 'full' }) },
        )}
      </ChartText>
      <ChartText as="div" tone={'costBasisText'}>
        {i18n.t('ui.incomeplacementrelationshipchart.netSalaryWithValues', {
          amount: formatMoney(point.netSalary, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={'passiveIncomeSecondary'}>
        {i18n.t('ui.incomeplacementrelationshipchart.otherIncomeWithValues', {
          amount: formatMoney(point.otherIncome, { style: 'full' }),
        })}
      </ChartText>
      <ChartText
        as="div"
        tone={'netContributionsText'}
        style={{ marginTop: 6 }}
      >
        {i18n.t(
          'ui.incomeplacementrelationshipchart.netContributionsWithValues',
          {
            amount: formatMoney(point.placedSavings, {
              style: 'full',
              fallback: 0,
            }),
          },
        )}
      </ChartText>
      <ChartText as="div" tone={'returnRate'}>
        {i18n.t('ui.incomeplacementrelationshipchart.placementRateWithValues', {
          percentage: formatPercentage(point.placementRate, { fallback: 0 }),
        })}
      </ChartText>
      <ChartText as="div" tone={'tooltipDim'} style={{ marginTop: 6 }}>
        {i18n.t(
          'ui.incomeplacementrelationshipchart.unplacedIncomeProxyWithValues',
          {
            amount: formatMoney(point.unplacedIncomeProxy, {
              style: 'full',
              fallback: 0,
            }),
          },
        )}
      </ChartText>
    </TooltipBox>
  )
}

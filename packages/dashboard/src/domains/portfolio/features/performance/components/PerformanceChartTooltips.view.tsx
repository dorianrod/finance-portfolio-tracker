import type {
  TopPerformer,
  TriChartPoint,
} from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations'
import type { PassiveIncomePoint } from '@/domains/portfolio/features/performance/types/passiveIncomePoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function TriTooltip({
  active,
  payload,
  label,
}: NumericTooltipProps<TriChartPoint, Date | string | number>) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const tri1y =
    payload.find((point) => point.dataKey === 'tri_rolling_1y')?.value ?? null
  const tri1yBackfill =
    payload.find((point) => point.dataKey === 'tri_rolling_1y_backfill')
      ?.value ?? null
  const tri3y =
    payload.find((point) => point.dataKey === 'tri_rolling_3y')?.value ?? null
  const tri3yBackfill =
    payload.find((point) => point.dataKey === 'tri_rolling_3y_backfill')
      ?.value ?? null
  const showTri1y = tri1y !== null || tri1yBackfill !== null
  const showTri3y = tri3y !== null || tri3yBackfill !== null
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      {showTri1y && (
        <ChartText
          as="div"
          tone={PORTFOLIO_CHART_TONES.totalChange}
          variant="strong"
        >
          {i18n.t('ui.portfoliochartsTooltips.irr1yWithValues', {
            value: formatPercentage(tri1y, {
              decimals: 2,
              signed: true,
              fallback: i18n.t('ui.portfoliochartsTooltips.notYetAvailable'),
            }),
          })}
        </ChartText>
      )}
      {showTri3y && (
        <Layout as="div" spaceBefore="compact">
          <ChartText
            as="div"
            tone={PORTFOLIO_CHART_TONES.returnRate}
            variant="strong"
          >
            {i18n.t('ui.portfoliochartsTooltips.irr3yWithValues', {
              value: formatPercentage(tri3y, {
                decimals: 2,
                signed: true,
                fallback: i18n.t('ui.portfoliochartsTooltips.notYetAvailable'),
              }),
            })}
          </ChartText>
        </Layout>
      )}
    </TooltipBox>
  )
}

export function TopPerformersTooltip({
  active,
  payload,
  label,
}: NumericTooltipProps<TopPerformer>) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {entry?.name ?? label}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipDim'} variant="micro">
          {entry?.account_type}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'}>
          {i18n.t('ui.portfoliochartsTooltips.valueWithValues', {
            amount: formatMoney(entry?.value, { style: 'full', fallback: 0 }),
          })}
        </ChartText>
      </Layout>
      <ChartText
        as="div"
        tone={
          (entry?.pct ?? 0) >= 0
            ? PORTFOLIO_CHART_TONES.performancePositiveText
            : PORTFOLIO_CHART_TONES.performanceNegativeText
        }
        variant="strong"
      >
        {i18n.t('ui.portfoliochartsTooltips.unrealizedWithValues', {
          amount: formatMoney(entry?.gain, { style: 'full', fallback: 0 }),
          percentage: formatPercentage(entry?.pct, {
            signed: true,
            fallback: 0,
          }),
        })}
      </ChartText>
    </TooltipBox>
  )
}

export function PassiveIncomeTooltip({
  active,
  payload,
  label,
}: NumericTooltipProps<PassiveIncomePoint>) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const div = tooltipValue(payload, 'dividends')
  const int = tooltipValue(payload, 'interest')
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {label}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(div + int, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {div > 0 && (
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.passiveIncome}>
          {i18n.t('ui.portfoliochartsTooltips.dividendsWithValues', {
            amount: formatMoney(div, { style: 'full' }),
          })}
        </ChartText>
      )}
      {int > 0 && (
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.passiveIncomeSecondary}>
          {i18n.t('ui.portfoliochartsTooltips.interestWithValues', {
            amount: formatMoney(int, { style: 'full' }),
          })}
        </ChartText>
      )}
    </TooltipBox>
  )
}

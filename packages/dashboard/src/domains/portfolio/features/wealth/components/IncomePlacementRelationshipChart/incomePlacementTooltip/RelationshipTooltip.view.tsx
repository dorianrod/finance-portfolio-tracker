import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

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
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {point.year}
        </ChartText>
      </Layout>
      <ChartText as="div" tone={'tooltipLabel'}>
        {i18n.t(
          'ui.incomeplacementrelationshipchart.totalNetIncomeWithValues',
          { amount: formatMoney(point.totalIncome, { style: 'full' }) },
        )}
      </ChartText>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.incomeplacementrelationshipchart.netSalaryWithValues', {
          amount: formatMoney(point.netSalary, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.passiveIncomeSecondary}>
        {i18n.t('ui.incomeplacementrelationshipchart.otherIncomeWithValues', {
          amount: formatMoney(point.otherIncome, { style: 'full' }),
        })}
      </ChartText>
      <Layout as="div" spaceBefore="compact">
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.netContributionsText}>
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
      </Layout>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.returnRate}>
        {i18n.t('ui.incomeplacementrelationshipchart.placementRateWithValues', {
          percentage: formatPercentage(point.placementRate, { fallback: 0 }),
        })}
      </ChartText>
      <Layout as="div" spaceBefore="compact">
        <ChartText as="div" tone={'tooltipDim'}>
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
      </Layout>
    </TooltipBox>
  )
}

import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function IncomeSavingsTooltip({
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
  const suffix =
    point.incomeStatus === 'forecast'
      ? i18n.t('ui.annualincomesavingschart.forecast')
      : ''
  const savingsSuffix =
    point.savingsStatus === 'partial'
      ? i18n.t('ui.annualincomesavingschart.ytdThrough', {
          date: point.savingsThrough,
        })
      : ''
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {point.year}
          {suffix}
        </ChartText>
      </Layout>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.annualincomesavingschart.netSalaryWithValues', {
          amount: formatMoney(point.netSalary, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.passiveIncomeSecondary}>
        {i18n.t('ui.annualincomesavingschart.otherIncomeWithValues', {
          amount: formatMoney(point.otherIncome, { style: 'full' }),
        })}
      </ChartText>
      <Layout as="div" spaceBefore="compact">
        <ChartText as="div" tone={'tooltipLabel'}>
          {i18n.t('ui.annualincomesavingschart.totalNetIncomeWithValues', {
            amount: formatMoney(point.totalIncome, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceBefore="compact">
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.netContributionsText}>
          {i18n.t('ui.annualincomesavingschart.netContributionsWithValues', {
            value: formatMoney(point.placedSavings, { style: 'full' }),
            savingsSuffix,
          })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceBefore="compact">
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.returnRate}>
          {i18n.t('ui.annualincomesavingschart.placementRateWithValues', {
            value: formatPercentage(point.placementRate, {
              fallback: i18n.t('ui.annualincomesavingschart.notComparable'),
            }),
          })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceBefore="compact" inset="compact">
        <ChartText as="div" tone={'tooltipDim'} separator>
          {i18n.t('ui.annualincomesavingschart.unplacedIncomeProxyWithValues', {
            value: formatMoney(point.unplacedIncomeProxy, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}

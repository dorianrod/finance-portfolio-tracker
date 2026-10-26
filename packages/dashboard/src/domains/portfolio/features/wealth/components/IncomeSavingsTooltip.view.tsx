import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
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
    <TooltipBox minWidth={235}>
      <ChartText
        as="div"
        tone={'tooltipText'}
        variant="strong"
        style={{ marginBottom: 7 }}
      >
        {point.year}
        {suffix}
      </ChartText>
      <ChartText as="div" tone={'costBasisText'}>
        {i18n.t('ui.annualincomesavingschart.netSalaryWithValues', {
          amount: formatMoney(point.netSalary, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={'passiveIncomeSecondary'}>
        {i18n.t('ui.annualincomesavingschart.otherIncomeWithValues', {
          amount: formatMoney(point.otherIncome, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'} style={{ marginTop: 4 }}>
        {i18n.t('ui.annualincomesavingschart.totalNetIncomeWithValues', {
          amount: formatMoney(point.totalIncome, { style: 'full' }),
        })}
      </ChartText>
      <ChartText
        as="div"
        tone={'netContributionsText'}
        style={{ marginTop: 7 }}
      >
        {i18n.t('ui.annualincomesavingschart.netContributionsWithValues', {
          value: formatMoney(point.placedSavings, { style: 'full' }),
          savingsSuffix,
        })}
      </ChartText>
      <ChartText as="div" tone={'returnRate'} style={{ marginTop: 4 }}>
        {i18n.t('ui.annualincomesavingschart.placementRateWithValues', {
          value: formatPercentage(point.placementRate, {
            fallback: i18n.t('ui.annualincomesavingschart.notComparable'),
          }),
        })}
      </ChartText>
      <ChartText
        as="div"
        tone={'tooltipDim'}
        separator
        style={{ marginTop: 7, paddingTop: 7 }}
      >
        {i18n.t('ui.annualincomesavingschart.unplacedIncomeProxyWithValues', {
          value: formatMoney(point.unplacedIncomeProxy, { style: 'full' }),
        })}
      </ChartText>
    </TooltipBox>
  )
}

import type { PassiveIncomePoint } from '@/domains/portfolio/features/performance/types/passiveIncomePoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

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

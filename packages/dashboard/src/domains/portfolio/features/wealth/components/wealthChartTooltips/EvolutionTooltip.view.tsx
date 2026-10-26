import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function EvolutionTooltip({
  active,
  payload,
  label,
  percentageMode = false,
}: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const cost = row?.total_cost_basis ?? 0
  const gain = row?.unrealized_gain ?? 0
  const total = cost + gain
  const share = (value: number) =>
    total === 0 ? '—' : formatPercentage((value / total) * 100)
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.portfoliochartsTooltips.costBasisWithValues', {
          amount: formatMoney(cost, { style: 'full' }),
          value: percentageMode ? ` · ${share(cost)}` : '',
        })}
      </ChartText>
      <ChartText
        as="div"
        tone={
          gain >= 0
            ? PORTFOLIO_CHART_TONES.performancePositiveText
            : PORTFOLIO_CHART_TONES.performanceNegativeText
        }
      >
        {i18n.t('ui.portfoliochartsTooltips.unrealizedProfitLoss', {
          amount: formatMoney(gain, { style: 'full' }),
          share: percentageMode ? ` · ${share(gain)}` : '',
        })}
      </ChartText>
    </TooltipBox>
  )
}

type EvolutionTooltipProps = NumericTooltipProps<
  PortfolioHistoryPoint,
  Date | string | number
> & {
  percentageMode?: boolean
}

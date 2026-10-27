import { computePortfolioComposition } from '@/domains/portfolio/features/wealth/helpers/calculators/computePortfolioComposition'
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

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Monetary and percentage display are variants of the same value-evolution tooltip.
export function EvolutionTooltip({
  active,
  payload,
  label,
  percentageMode = false,
}: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const row = payload[0]?.payload
  const { cost, gain, total, costShare, gainShare } =
    computePortfolioComposition(row)
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
          value: percentageMode
            ? i18n.t('ui.formatters.detail', {
                value: formatPercentage(costShare),
              })
            : '',
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
          share: percentageMode
            ? i18n.t('ui.formatters.detail', {
                value: formatPercentage(gainShare),
              })
            : '',
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

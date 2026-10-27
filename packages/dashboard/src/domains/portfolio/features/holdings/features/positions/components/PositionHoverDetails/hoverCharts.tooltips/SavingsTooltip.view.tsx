import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

// eslint-disable-next-line complexity -- Optional Recharts metadata and signed balance changes form one savings tooltip.
export function SavingsTooltip({
  active,
  payload,
}: NumericTooltipProps<SavingsPoint>) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const balance = tooltipValue(payload, 'balance')
  const delta: number = payload[0]?.payload?.delta ?? 0
  const monthStr: string = payload[0]?.payload?.month ?? ''
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {formatDate(`${monthStr}-02`, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.hoverchartsTooltips.balanceWithValues', {
            amount: formatMoney(balance),
          })}
        </ChartText>
      </Layout>
      {delta !== 0 && (
        <ChartText
          as="div"
          tone={
            delta >= 0
              ? PORTFOLIO_CHART_TONES.netContributionsText
              : PORTFOLIO_CHART_TONES.performanceNegativeText
          }
        >
          {delta >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(delta))}
        </ChartText>
      )}
    </TooltipBox>
  )
}

type SavingsPoint = {
  balance: number
  delta: number
  month: string
}

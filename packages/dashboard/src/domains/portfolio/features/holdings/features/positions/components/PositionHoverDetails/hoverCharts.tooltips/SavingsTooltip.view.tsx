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

export function SavingsTooltip({
  active,
  payload,
}: NumericTooltipProps<SavingsPoint>) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const balance = tooltipValue(payload, 'balance')
  const point = payload[0]?.payload
  const monthStr = point?.month ?? ''
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
      <SavingsChange point={point} />
    </TooltipBox>
  )
}

type SavingsPoint = {
  balance: number
  delta: number
  month: string
}

function SavingsChange({ point }: { point: SavingsPoint | undefined }) {
  const delta = point?.delta ?? 0
  const formatMoney = useFormatMoney()
  return (
    <>
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
    </>
  )
}

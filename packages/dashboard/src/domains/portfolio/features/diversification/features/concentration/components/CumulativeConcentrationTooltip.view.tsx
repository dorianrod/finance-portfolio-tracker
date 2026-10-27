import type { CumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/helpers/calculators/concentrationCalculations/concentrationCalculations.types'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function CumulativeConcentrationTooltip({
  active,
  payload,
}: CumulativeConcentrationTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const point = payload[0].payload

  return (
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {i18n.t('ui.cumulativeconcentrationtooltip.topAssets', {
          count: point.rank,
          percentage: formatPercentage(point.cumulativeWeight),
        })}
      </ChartText>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipLabel'}>
          #{point.rank} {point.name}
        </ChartText>
      </Layout>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={PORTFOLIO_CHART_TONES.riskSecondary}>
          {formatMoney(point.value, { style: 'full' })} ·{' '}
          {formatPercentage(point.weight)}
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}

type CumulativeConcentrationTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: CumulativeConcentrationPoint }>
}

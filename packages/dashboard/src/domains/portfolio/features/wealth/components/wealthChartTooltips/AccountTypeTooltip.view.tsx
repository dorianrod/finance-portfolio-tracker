import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function AccountTypeTooltip({
  active,
  payload,
  label,
  portfolioTotal,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  portfolioTotal?: number
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  const cost =
    point?.total_cost_basis ??
    payload.find((p) => p.dataKey === 'total_cost_basis')?.value ??
    0
  const gain =
    point?.unrealized_gain ??
    payload.find((p) => p.dataKey === 'unrealized_gain')?.value ??
    0
  const total = point?.total_value ?? cost + gain
  const portfolioShare =
    portfolioTotal && portfolioTotal > 0 ? (total / portfolioTotal) * 100 : 0
  const gainPct = cost > 0 ? (gain / cost) * 100 : 0
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {point?.account_type ?? label}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      {portfolioTotal != null && (
        <Layout as="div" spaceAfter="compact">
          <ChartText as="div" tone={'tooltipDim'}>
            {i18n.t('ui.portfoliochartsTooltips.portfolioShareWithValues', {
              percentage: formatPercentage(portfolioShare),
            })}
          </ChartText>
        </Layout>
      )}
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.portfoliochartsTooltips.costBasisWithValues2', {
          amount: formatMoney(cost, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.performancePositiveText}>
        {i18n.t('ui.portfoliochartsTooltips.unrealizedWithValues', {
          amount: formatMoney(gain, { style: 'full' }),
          percentage: formatPercentage(gainPct, { signed: true }),
        })}
      </ChartText>
    </TooltipBox>
  )
}

type AccountTypeTooltipPoint = {
  account_type: string
  total_cost_basis: number
  unrealized_gain: number
  total_value: number
}

type TooltipPayloadItem = {
  dataKey: string
  value: number
  payload?: AccountTypeTooltipPoint
}

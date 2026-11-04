import {
  type AccountTypeTooltipPayloadItem,
  computeAccountTypeTooltipMetrics,
} from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/helpers/presenters/computeAccountTypeTooltipMetrics'
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
  payload?: AccountTypeTooltipPayloadItem[]
  label?: string
  portfolioTotal?: number
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const point = payload[0].payload
  const { cost, gain, total, portfolioShare, gainPct } =
    computeAccountTypeTooltipMetrics(payload, portfolioTotal)
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
      <ChartText
        as="div"
        tone={
          gain >= 0
            ? PORTFOLIO_CHART_TONES.performancePositiveText
            : PORTFOLIO_CHART_TONES.performanceNegativeText
        }
      >
        {i18n.t('ui.portfoliochartsTooltips.unrealizedWithValues', {
          amount: formatMoney(gain, { style: 'full' }),
          percentage: formatPercentage(gainPct, { signed: true }),
        })}
      </ChartText>
    </TooltipBox>
  )
}

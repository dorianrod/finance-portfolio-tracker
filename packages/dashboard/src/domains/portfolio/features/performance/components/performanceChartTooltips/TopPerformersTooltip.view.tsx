import type { TopPerformer } from '@/domains/portfolio/features/performance/types/topPerformer.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Optional name, account and amount metadata all describe one Recharts performer point.
export function TopPerformersTooltip({
  active,
  payload,
  label,
}: NumericTooltipProps<TopPerformer>) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const entry = payload[0]?.payload
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'} variant="strong">
          {entry?.name ?? label}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipDim'} variant="micro">
          {entry?.account_type}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'}>
          {i18n.t('ui.portfoliochartsTooltips.valueWithValues', {
            amount: formatMoney(entry?.value, { style: 'full', fallback: 0 }),
          })}
        </ChartText>
      </Layout>
      <ChartText
        as="div"
        tone={
          (entry?.pct ?? 0) >= 0
            ? PORTFOLIO_CHART_TONES.performancePositiveText
            : PORTFOLIO_CHART_TONES.performanceNegativeText
        }
        variant="strong"
      >
        {i18n.t('ui.portfoliochartsTooltips.unrealizedWithValues', {
          amount: formatMoney(entry?.gain, { style: 'full', fallback: 0 }),
          percentage: formatPercentage(entry?.pct, {
            signed: true,
            fallback: 0,
          }),
        })}
      </ChartText>
    </TooltipBox>
  )
}

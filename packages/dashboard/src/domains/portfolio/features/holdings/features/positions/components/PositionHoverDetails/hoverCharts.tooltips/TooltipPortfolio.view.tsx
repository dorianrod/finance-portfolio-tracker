import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { OpSummary } from './OpSummary.view'

// eslint-disable-next-line complexity -- Value, cost basis and unrealized availability describe one hover point and its operation summary.
export function TooltipPortfolio({
  active,
  payload,
  label,
}: NumericTooltipProps<HoverChartDataPoint>) {
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const valueEntry = payload.find((item) => item.dataKey === 'Value')
  const costEntry = payload.find((item) => item.dataKey === 'Cost basis')
  const data = payload[0]?.payload
  const unrealized = valueEntry && costEntry && data ? data.unrealized : null
  return (
    <TooltipBox variant="raised">
      <Layout spaceAfter="default">
        <Text as="p" tone="muted">
          {label}
        </Text>
      </Layout>
      {valueEntry && (
        <ChartText as="p" series={valueEntry}>
          {valueEntry.name}: {formatMoney(valueEntry.value, { fallback: 0 })}
        </ChartText>
      )}
      {costEntry && (
        <ChartText as="p" series={costEntry}>
          {costEntry.name}: {formatMoney(costEntry.value, { fallback: 0 })}
        </ChartText>
      )}
      {unrealized != null && (
        <Layout spaceBefore="compact">
          <Text
            as="p"
            variant="strong"
            tone={unrealized >= 0 ? 'positive' : 'negative'}
          >
            {i18n.t('ui.hoverchartsTooltips.unrealizedWithValues', {
              amount: formatMoney(unrealized),
            })}
          </Text>
        </Layout>
      )}
      <OpSummary data={data} />
    </TooltipBox>
  )
}

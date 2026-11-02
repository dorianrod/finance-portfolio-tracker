import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/buildHoverChartData/buildHoverChartData.types'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import type {
  NumericTooltipPayload,
  NumericTooltipProps,
} from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { OpSummary } from './OpSummary.view'

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
  return (
    <TooltipBox variant="raised">
      <Layout spaceAfter="default">
        <Text as="p" tone="muted">
          {label}
        </Text>
      </Layout>
      {valueEntry && (
        <ChartText as="p" series={valueEntry}>
          {i18n.t('ui.hoverchartsTooltips.seriesValue', {
            label: valueEntry.name,
            amount: formatMoney(valueEntry.value, { fallback: 0 }),
          })}
        </ChartText>
      )}
      {costEntry && (
        <ChartText as="p" series={costEntry}>
          {i18n.t('ui.hoverchartsTooltips.seriesValue', {
            label: costEntry.name,
            amount: formatMoney(costEntry.value, { fallback: 0 }),
          })}
        </ChartText>
      )}
      <PortfolioUnrealized
        valueEntry={valueEntry}
        costEntry={costEntry}
        data={data}
      />
      <OpSummary data={data} />
    </TooltipBox>
  )
}

function PortfolioUnrealized({
  valueEntry,
  costEntry,
  data,
}: {
  valueEntry: NumericTooltipPayload<HoverChartDataPoint> | undefined
  costEntry: NumericTooltipPayload<HoverChartDataPoint> | undefined
  data: HoverChartDataPoint | undefined
}) {
  const formatMoney = useFormatMoney()
  const unrealized = valueEntry && costEntry && data ? data.unrealized : null
  return (
    <>
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
    </>
  )
}

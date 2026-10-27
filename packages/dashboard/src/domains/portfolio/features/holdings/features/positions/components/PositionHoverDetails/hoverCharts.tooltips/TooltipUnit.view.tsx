import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'
import { RollingUnitPricePerf } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/RollingUnitPricePerf.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { OpSummary } from './OpSummary.view'

export function TooltipUnit({
  active,
  payload,
  label,
}: NumericTooltipProps<HoverChartDataPoint>) {
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const p = payload[0]
  const data = p?.payload
  return (
    <TooltipBox variant="raised">
      <Layout spaceAfter="compact">
        <Text as="p" tone="muted">
          {label}
        </Text>
      </Layout>
      <ChartText as="p" series={p}>
        {i18n.t('ui.hoverchartsTooltips.unitPriceWithValues', {
          amount: formatMoney(p.value, { style: 'decimal', fallback: 0 }),
        })}
      </ChartText>
      <RollingUnitPricePerf rows={data?.rollingReturns ?? []} />
      <OpSummary data={data} />
    </TooltipBox>
  )
}

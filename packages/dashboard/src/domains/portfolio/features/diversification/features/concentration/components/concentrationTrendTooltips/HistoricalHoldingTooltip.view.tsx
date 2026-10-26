import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import type { HoldingTooltipProps } from './concentrationTrendTooltips.types'

export function HistoricalHoldingTooltip({
  active,
  payload,
}: HoldingTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const holding = payload[0].payload
  return (
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {holding.name}
      </ChartText>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipLabel'}>
          {formatMoney(holding.value, { style: 'full' })} ·{' '}
          {formatPercentage(holding.weight)}
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}

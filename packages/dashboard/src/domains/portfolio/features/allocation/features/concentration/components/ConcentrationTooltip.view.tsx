import type { HoldingConcentration } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export type ConcentrationTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HoldingConcentration }>
}

export function ConcentrationTooltip({
  active,
  payload,
}: ConcentrationTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0].payload as HoldingConcentration
  return (
    <Surface variant="tooltip" className="px-3 py-2">
      <Text as="div" variant="strong" tone="default">
        {row.name}
      </Text>
      <Text as="div" tone="secondary" className="mt-1">
        {formatMoney(row.value, { style: 'full' })} ·{' '}
        {formatPercentage(row.weight)}
      </Text>
    </Surface>
  )
}

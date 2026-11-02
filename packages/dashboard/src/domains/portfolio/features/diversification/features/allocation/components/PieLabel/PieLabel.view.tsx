import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'

import { resolvePieLabel } from './helpers/presenters/resolvePieLabel'

export function PieLabel(props: Parameters<typeof resolvePieLabel>[0]) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const label = resolvePieLabel(props)
  if (!label) return null
  const { name, value, percent, x, y, anchor } = label
  return (
    <ChartLabel variant="pie" align={anchor}>
      <ChartLabel as="tspan" variant="pie" x={x} y={y - 6} tone="label">
        {name}
      </ChartLabel>
      <ChartLabel as="tspan" variant="pie" x={x} y={y + 6} tone="tick">
        {formatMoney(value, { style: 'compact' })} ·{' '}
        {formatPercentage(percent * 100)}
      </ChartLabel>
    </ChartLabel>
  )
}

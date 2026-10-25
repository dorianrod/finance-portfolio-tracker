import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

import { getPieLabelPosition } from './helpers/presenters/getPieLabelPosition'

export function PieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  percent,
}: {
  cx?: number
  cy?: number
  midAngle?: number
  outerRadius?: number
  name?: string
  value?: number
  percent?: number
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!cx || !cy || !midAngle || !outerRadius || !name || !value || !percent)
    return null
  if (percent < 0.025) return null
  const { x, y, anchor } = getPieLabelPosition(cx, cy, midAngle, outerRadius)
  return (
    <text fontSize={10} textAnchor={anchor} dominantBaseline="central">
      <tspan x={x} y={y - 6} fill="var(--chart-label)">
        {name}
      </tspan>
      <tspan x={x} y={y + 6} fill="var(--chart-tick)">
        {formatMoney(value, { style: 'compact' })} ·{' '}
        {formatPercentage(percent * 100)}
      </tspan>
    </text>
  )
}

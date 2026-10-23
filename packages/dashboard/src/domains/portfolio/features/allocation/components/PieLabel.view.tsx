import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function PieLabel({
  cx, cy, midAngle, outerRadius, name, value, percent,
}: {
  cx?: number; cy?: number; midAngle?: number; outerRadius?: number;
  name?: string; value?: number; percent?: number;
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!cx || !cy || !midAngle || !outerRadius || !name || !value || !percent) return null
  if (percent < 0.025) return null
  const RAD = Math.PI / 180
  const r = outerRadius + 22
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  const anchor = x > cx ? 'start' : 'end'
  return (
    <text fontSize={10} textAnchor={anchor} dominantBaseline="central">
      <tspan x={x} y={y - 6} fill="var(--chart-label)">{name}</tspan>
      <tspan x={x} y={y + 6} fill="var(--chart-tick)">{formatMoney(value, { style: 'compact' })} · {formatPercentage(percent * 100)}</tspan>
    </text>
  )
}

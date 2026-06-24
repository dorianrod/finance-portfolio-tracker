import { fmtEur } from '@/shared/format/money'

export function PieLabel({
  cx, cy, midAngle, outerRadius, name, value, percent,
}: {
  cx?: number; cy?: number; midAngle?: number; outerRadius?: number;
  name?: string; value?: number; percent?: number;
}) {
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
      <tspan x={x} y={y + 6} fill="var(--chart-tick)">{fmtEur(value)} · {(percent * 100).toFixed(1)}%</tspan>
    </text>
  )
}

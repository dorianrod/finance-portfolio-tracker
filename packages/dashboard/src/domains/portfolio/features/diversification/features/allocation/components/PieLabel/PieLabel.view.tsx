import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartLabel } from '@/shared/ui/chartLabel/ChartLabel.view'

import { getPieLabelPosition } from './helpers/presenters/getPieLabelPosition'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Optional Recharts geometry and minimum-share guards protect one SVG label; positioning is already delegated.
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
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    outerRadius == null ||
    outerRadius === 0 ||
    !name ||
    value == null ||
    value === 0 ||
    percent == null ||
    percent === 0
  )
    return null
  if (percent < 0.025) return null
  const { x, y, anchor } = getPieLabelPosition(cx, cy, midAngle, outerRadius)
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

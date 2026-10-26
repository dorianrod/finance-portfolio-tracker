import { CHART_COLORS, type ChartTone } from '@/shared/theme/chartColors'

export function ChartMarker({
  cx,
  cy,
  tone,
  outline,
  size = 'standard',
}: {
  cx?: number
  cy?: number
  tone: ChartTone
  outline: ChartTone
  size?: 'standard' | 'large'
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={CHART_COLORS[tone]}
      stroke={CHART_COLORS[outline]}
      r={size === 'large' ? 6 : 5}
      strokeWidth={2}
    />
  )
}

import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { ChartMarker } from '@/shared/ui/ChartMarker.view'

type BuySellDotProps = {
  cx?: number
  cy?: number
  payload?: HoverChartDataPoint
}
export function BuySellDot({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy && payload.hasSell)
    return <ChartMarker cx={cx} cy={cy} tone="series11" outline="series11Stroke" size="large" />
  if (payload.hasBuy) return <ChartMarker cx={cx} cy={cy} tone="series1" outline="series1Stroke" />
  if (payload.hasSell) return <ChartMarker cx={cx} cy={cy} tone="series7" outline="series7Stroke" />
  return <g />
}
export function BuySellDotUnit({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy) return <ChartMarker cx={cx} cy={cy} tone="series1" outline="series1Stroke" />
  if (payload.hasSell) return <ChartMarker cx={cx} cy={cy} tone="series7" outline="series7Stroke" />
  return <g />
}

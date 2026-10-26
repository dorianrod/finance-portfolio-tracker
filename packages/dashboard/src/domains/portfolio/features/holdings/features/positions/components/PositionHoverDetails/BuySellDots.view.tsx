import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { TransactionMarker } from '@/shared/ui/TransactionMarker.view'

type BuySellDotProps = {
  cx?: number
  cy?: number
  payload?: HoverChartDataPoint
}
export function BuySellDot({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy && payload.hasSell)
    return <TransactionMarker cx={cx} cy={cy} kind="mixed" />
  if (payload.hasBuy) return <TransactionMarker cx={cx} cy={cy} kind="buy" />
  if (payload.hasSell) return <TransactionMarker cx={cx} cy={cy} kind="sell" />
  return <g />
}
export function BuySellDotUnit({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy) return <TransactionMarker cx={cx} cy={cy} kind="buy" />
  if (payload.hasSell) return <TransactionMarker cx={cx} cy={cy} kind="sell" />
  return <g />
}

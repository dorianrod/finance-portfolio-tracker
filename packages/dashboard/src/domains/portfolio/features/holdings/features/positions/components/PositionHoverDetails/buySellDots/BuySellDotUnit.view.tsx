import { ChartMarker } from '@/shared/ui/ChartMarker.view'

import type { BuySellDotProps } from './buySellDots.types'

export function BuySellDotUnit({ cx, cy, payload }: BuySellDotProps) {
  if (!payload) return <g />
  if (payload.hasBuy)
    return (
      <ChartMarker cx={cx} cy={cy} tone="series1" outline="series1Stroke" />
    )
  if (payload.hasSell)
    return (
      <ChartMarker cx={cx} cy={cy} tone="series7" outline="series7Stroke" />
    )
  return <g />
}

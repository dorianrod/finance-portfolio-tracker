import type { CartesianViewBox } from 'recharts'

import type { YearLabelPlacement } from '@/domains/portfolio/features/wealth/helpers/calculators/calculateYearLabelLayout'

export function getYearLabelPosition(
  viewBox: CartesianViewBox,
  placement: YearLabelPlacement,
) {
  const width = Number(viewBox.width ?? 0)
  const height = Number(viewBox.height ?? 0)
  return {
    x: Number(viewBox.x) + width / 2 + placement.dx,
    y: Number(viewBox.y) + height / 2 + placement.dy,
  }
}

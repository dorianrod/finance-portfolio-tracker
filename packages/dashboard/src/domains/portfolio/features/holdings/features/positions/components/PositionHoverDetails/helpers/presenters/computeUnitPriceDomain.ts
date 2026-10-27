import type { HoverChartDataPoint } from '../calculators/buildHoverChartData/buildHoverChartData.types'

export function computeUnitPriceDomain(
  chartData: HoverChartDataPoint[],
): [number, number] | undefined {
  const unitPrices = chartData.map((d) => d['Unit price']).filter((v) => v > 0)
  if (unitPrices.length === 0) return undefined
  const min = Math.min(...unitPrices)
  const max = Math.max(...unitPrices)
  const rangePadding = (max - min) * 0.15
  const padding = rangePadding > 0 ? rangePadding : max * 0.05
  return [Math.max(0, min - padding), max + padding]
}

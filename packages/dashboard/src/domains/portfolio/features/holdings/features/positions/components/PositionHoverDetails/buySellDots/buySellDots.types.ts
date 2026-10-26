import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'

export type BuySellDotProps = {
  cx?: number
  cy?: number
  payload?: HoverChartDataPoint
}

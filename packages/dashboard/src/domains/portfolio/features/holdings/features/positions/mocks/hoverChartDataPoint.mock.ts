import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/transformers/buildHoverChartData/buildHoverChartData.types'

export function point(unitPrice: number): HoverChartDataPoint {
  return {
    date: 'd',
    Value: 0,
    'Cost basis': 0,
    'Unit price': unitPrice,
    hasBuy: false,
    hasSell: false,
    unrealized: 0,
    rollingReturns: [],
  }
}

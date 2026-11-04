import type { PositionChartOperation } from './positionChartOperation.type'

export type ChartTarget = {
  isin: string
  name: string
  operations: PositionChartOperation[]
  buttonRect: DOMRect
}

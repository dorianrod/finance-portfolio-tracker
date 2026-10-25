import type { Operation } from './positionChartOperation.type'

export type ChartTarget = {
  isin: string
  name: string
  operations: Operation[]
  buttonRect: DOMRect
}

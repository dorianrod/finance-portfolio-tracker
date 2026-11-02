import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'

import {
  type ConcentrationChangePoint,
  withConcentrationChanges,
} from '../transformers/withConcentrationChanges'

export function buildConcentrationChartRows(
  points: HistoricalConcentrationPoint[],
): ConcentrationChartRow[] {
  return withConcentrationChanges(points).map((point) => ({
    ...point,
    timestamp: point.date.getTime(),
  }))
}

export type ConcentrationChartRow = ConcentrationChangePoint & {
  timestamp: number
}

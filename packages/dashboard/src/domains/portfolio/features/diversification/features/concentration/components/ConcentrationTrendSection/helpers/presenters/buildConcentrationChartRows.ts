import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'

export function buildConcentrationChartRows(
  points: HistoricalConcentrationPoint[],
): ConcentrationChartRow[] {
  return points.map((point, index) => {
    const previous = points[index - 1]
    return {
      ...point,
      timestamp: point.date.getTime(),
      positionsTo25Delta: delta(
        point.positionsTo25Pct,
        previous?.positionsTo25Pct,
      ),
      positionsTo50Delta: delta(
        point.positionsTo50Pct,
        previous?.positionsTo50Pct,
      ),
      positionsTo75Delta: delta(
        point.positionsTo75Pct,
        previous?.positionsTo75Pct,
      ),
      positionsTo90Delta: delta(
        point.positionsTo90Pct,
        previous?.positionsTo90Pct,
      ),
    }
  })
}

export type ConcentrationChartRow = HistoricalConcentrationPoint & {
  timestamp: number
  positionsTo25Delta: number | null
  positionsTo50Delta: number | null
  positionsTo75Delta: number | null
  positionsTo90Delta: number | null
}

function delta(
  current: number | null,
  previous: number | null | undefined,
): number | null {
  return current == null || previous == null ? null : current - previous
}

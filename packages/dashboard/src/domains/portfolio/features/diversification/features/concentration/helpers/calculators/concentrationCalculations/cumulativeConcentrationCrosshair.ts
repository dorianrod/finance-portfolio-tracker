import type { CumulativeConcentrationPoint } from './concentrationCalculations.types'

export function cumulativeConcentrationCrosshair(
  point: CumulativeConcentrationPoint | null,
): { x: number; y: number } | null {
  return point ? { x: point.rank, y: point.cumulativeWeight } : null
}

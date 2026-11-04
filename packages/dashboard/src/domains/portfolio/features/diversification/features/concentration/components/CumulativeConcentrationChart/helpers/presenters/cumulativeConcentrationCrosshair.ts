import type { CumulativeConcentrationPoint } from '@/domains/portfolio/features/diversification/features/concentration/types/cumulativeConcentrationPoint.type'

export function cumulativeConcentrationCrosshair(
  point: CumulativeConcentrationPoint | null,
): { x: number; y: number } | null {
  return point ? { x: point.rank, y: point.cumulativeWeight } : null
}

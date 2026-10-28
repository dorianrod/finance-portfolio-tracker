import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/businessRules/isAssetAnalysisApplicablePosition'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function selectExposurePositions(
  positions: PositionRow[],
): PositionRow[] {
  return positions.filter(
    (position) =>
      position.status === 'active' &&
      (position.total_value ?? 0) > 0 &&
      isAssetAnalysisApplicablePosition(position),
  )
}

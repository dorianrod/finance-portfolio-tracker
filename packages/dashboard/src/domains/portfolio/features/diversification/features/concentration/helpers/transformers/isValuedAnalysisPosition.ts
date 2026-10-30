import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/transformers/isAssetAnalysisApplicablePosition'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

export function isValuedAnalysisPosition(position: PositionRow): boolean {
  if (position.status !== 'active' || (position.total_value ?? 0) <= 0)
    return false
  return isAssetAnalysisApplicablePosition(position)
}

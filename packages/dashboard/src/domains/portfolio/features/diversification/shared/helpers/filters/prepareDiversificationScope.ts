// eslint-disable-next-line local/review-shared-feature-sharing -- The shell distributes the prepared scope to both allocation and concentration; see DORIAN_REACT_AUDIT.md.
import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/quality/accountApplicability'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { excludeNonApplicableAllocationData } from './scopeDiversificationData/excludeNonApplicableAllocationData'
import { scopeRawAllocationData } from './scopeDiversificationData/scopeRawAllocationData'

export function prepareDiversificationScope(
  inputs: Pick<
    DiversificationInputs,
    'positions' | 'rawData' | 'accountFilters'
  >,
) {
  const applicablePositions = inputs.positions.filter(
    isAssetAnalysisApplicablePosition,
  )
  const scopedRawData = excludeNonApplicableAllocationData(
    scopeRawAllocationData(inputs.rawData, inputs.accountFilters),
    inputs.positions,
  )
  return {
    applicablePositions,
    scopedRawData,
    hasCurrentData: [
      scopedRawData.geo,
      scopedRawData.secteur,
      scopedRawData.currency,
      scopedRawData.classe,
    ].some((rows) => rows.length > 0),
    hasSelectedValue: inputs.positions.some(hasActiveValue),
    hasApplicableValue: applicablePositions.some(hasActiveValue),
  }
}

function hasActiveValue(position: PositionRow): boolean {
  return position.status === 'active' && (position.total_value ?? 0) > 0
}

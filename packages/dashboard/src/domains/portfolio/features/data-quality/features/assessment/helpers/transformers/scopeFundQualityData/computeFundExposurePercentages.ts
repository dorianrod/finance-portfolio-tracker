import { partitionPercentages } from '@/shared/helpers/transformers/partitionPercentages'

import type { FundExposurePercentages } from './scopeFundQualityData.types'

export function computeFundExposurePercentages(
  identifiedValue: number,
  unresolvedValue: number,
  notApplicableValue: number,
): FundExposurePercentages {
  const [identified, unresolved, notApplicable] = partitionPercentages([
    identifiedValue,
    unresolvedValue,
    notApplicableValue,
  ])
  return { identified, unresolved, notApplicable }
}

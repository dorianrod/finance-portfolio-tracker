import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'

import {
  type FundQualityCategory,
  getFundQualityPresentation,
} from './getFundQualityPresentation'

export function getFundQualityCategory(
  tier: FundQualityTier,
): FundQualityCategory {
  return getFundQualityPresentation(tier).category
}

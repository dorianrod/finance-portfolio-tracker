import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import { getFundQualityPresentation, type FundQualityCategory } from './getFundQualityPresentation'

export function getFundQualityCategory(tier: FundQualityTier): FundQualityCategory {
  return getFundQualityPresentation(tier).category
}

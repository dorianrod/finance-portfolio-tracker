import type { FundQualityTier } from '@/domains/portfolio/apis/queries/useFundHoldings'
import { getFundQualityPresentation, type FundQualityCategory } from './getFundQualityPresentation'

export function getFundQualityCategory(tier: FundQualityTier): FundQualityCategory {
  return getFundQualityPresentation(tier).category
}

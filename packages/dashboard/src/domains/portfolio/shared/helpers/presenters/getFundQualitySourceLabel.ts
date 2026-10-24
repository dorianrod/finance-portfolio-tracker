import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'
import { getFundQualityPresentation } from './getFundQualityPresentation'

export function getFundQualitySourceLabel(tier: FundQualityTier): string {
  return getFundQualityPresentation(tier).sourceLabel
}

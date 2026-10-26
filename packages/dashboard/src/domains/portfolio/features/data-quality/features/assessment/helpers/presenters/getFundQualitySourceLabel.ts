import { getFundQualityPresentation } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation'
import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'

export function getFundQualitySourceLabel(tier: FundQualityTier): string {
  return getFundQualityPresentation(tier).sourceLabel
}

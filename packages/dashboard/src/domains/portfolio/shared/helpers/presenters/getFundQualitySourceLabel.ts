import type { FundQualityTier } from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import { getFundQualityPresentation } from './getFundQualityPresentation'

export function getFundQualitySourceLabel(tier: FundQualityTier): string {
  return getFundQualityPresentation(tier).sourceLabel
}

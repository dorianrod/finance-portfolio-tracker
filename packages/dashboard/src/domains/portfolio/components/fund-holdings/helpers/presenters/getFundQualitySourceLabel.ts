import type { FundQualityTier } from '@/domains/portfolio/apis/queries/useFundHoldings'
import { getFundQualityPresentation } from './getFundQualityPresentation'

export function getFundQualitySourceLabel(tier: FundQualityTier): string {
  return getFundQualityPresentation(tier).sourceLabel
}

import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { FundQualityCategory } from '@/domains/portfolio/shared/types/fundQualityCategory.type'

export function getFundQualityCategory(
  tier: FundHoldingStatus['qualityTier'],
): FundQualityCategory {
  if (tier === 'A' || tier === 'B') return 'reliable'
  if (tier === 'C') return 'partial'
  return 'unavailable'
}

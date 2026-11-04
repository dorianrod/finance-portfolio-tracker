import { useCallback } from 'react'

import { useFormatFundQualityCategory } from '@/domains/portfolio/shared/helpers/formatters/useFormatFundQualityCategory'
import { getFundQualityCategory } from '@/domains/portfolio/shared/helpers/transformers/getFundQualityCategory'
import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'

export function useFormatFundQualityLabel() {
  const formatCategory = useFormatFundQualityCategory()
  return useCallback(
    (
      tier: FundQualityTier | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (tier == null) return fallback
      return formatCategory(getFundQualityCategory(tier))
    },
    [formatCategory],
  )
}

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { FundQualityTier } from '@/domains/portfolio/shared/types/fundHolding.type'

export function useFormatFundQualitySourceLabel() {
  const { t } = useTranslation()
  return useCallback(
    (
      tier: FundQualityTier | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (tier == null) return fallback
      switch (tier) {
        case 'A':
          return t('ui.getfundqualitypresentation.officialSource')
        case 'B':
          return t('ui.getfundqualitypresentation.exactProxy')
        case 'C':
          return t('ui.getfundqualitypresentation.partialSource')
        case 'D':
          return t('ui.getfundqualitypresentation.noUsableComposition')
      }
    },
    [t],
  )
}

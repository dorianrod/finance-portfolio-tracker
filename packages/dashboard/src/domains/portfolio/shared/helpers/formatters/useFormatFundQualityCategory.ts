import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { FundQualityCategory } from '@/domains/portfolio/shared/types/fundQualityCategory.type'

export function useFormatFundQualityCategory() {
  const { t } = useTranslation()
  return useCallback(
    (
      category: FundQualityCategory | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (category == null) return fallback
      switch (category) {
        case 'reliable':
          return t('ui.getfundqualitypresentation.reliable')
        case 'partial':
          return t('ui.getfundqualitypresentation.partial')
        case 'unavailable':
          return t('ui.getfundqualitypresentation.unavailable')
      }
    },
    [t],
  )
}

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'

export function useFormatExposureSourceLabel() {
  const { t } = useTranslation()
  return useCallback(
    (
      source: ExposureSource | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (source == null) return fallback
      return source.fund ?? t('ui.buildfundholdingsviewmodel.direct')
    },
    [t],
  )
}

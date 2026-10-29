import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityDimension.type'

export function useFormatDataQualityDimension() {
  const { t } = useTranslation()
  return useCallback(
    (
      dimension: DataQualityDimension | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (dimension == null) return fallback
      const labels: Record<DataQualityDimension, string> = {
        geo: t('ui.builddataqualityviewmodel.geography'),
        secteur: t('ui.builddataqualityviewmodel.sector'),
        currency: t('ui.builddataqualityviewmodel.currency'),
        classe: t('ui.builddataqualityviewmodel.assetClass'),
      }
      return labels[dimension]
    },
    [t],
  )
}

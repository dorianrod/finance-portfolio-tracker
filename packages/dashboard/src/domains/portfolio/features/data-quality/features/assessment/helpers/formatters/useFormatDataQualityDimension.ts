import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityDimension.type'

export function useFormatDataQualityDimension() {
  const { t } = useTranslation()
  return useCallback(
    (
      dimension: DataQualityDimension | null | undefined,
      {
        fallback = '—',
        style = 'lowercase',
      }: { fallback?: string; style?: 'lowercase' | 'title' } = {},
    ): string => {
      if (dimension == null) return fallback
      if (style === 'title') {
        const labels: Record<DataQualityDimension, string> = {
          geo: t('ui.allocationdimensionquality.geography'),
          secteur: t('ui.allocationdimensionquality.sector'),
          currency: t('ui.allocationdimensionquality.currency'),
          classe: t('ui.allocationdimensionquality.assetClass'),
        }
        return labels[dimension]
      }
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

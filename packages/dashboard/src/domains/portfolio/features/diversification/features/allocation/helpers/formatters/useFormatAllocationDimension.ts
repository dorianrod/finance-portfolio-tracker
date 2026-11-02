import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'

export function useFormatAllocationDimension() {
  const { t } = useTranslation()
  return useCallback(
    (
      dimension: AllocationDimension | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (dimension == null) return fallback
      const labels: Record<AllocationDimension, string> = {
        geo: t('ui.filterchipbar.geo'),
        secteur: t('ui.filterchipbar.sector'),
        currency: t('ui.filterchipbar.currency'),
        classe: t('ui.filterchipbar.class'),
      }
      return labels[dimension]
    },
    [t],
  )
}

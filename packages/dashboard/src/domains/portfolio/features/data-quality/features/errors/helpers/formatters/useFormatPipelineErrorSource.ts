import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useFormatPipelineErrorSource() {
  const { t } = useTranslation()
  return useCallback(
    (
      source: string | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (source == null || source === '') return fallback
      const labels = new Map([
        ['main', t('ui.errorstab.ingestPortfolioPy')],
        ['fetch_prices', t('ui.errorstab.fetchPricesPy')],
      ])
      return labels.get(source) ?? source
    },
    [t],
  )
}

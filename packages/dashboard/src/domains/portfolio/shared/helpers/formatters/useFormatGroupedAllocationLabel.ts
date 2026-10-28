import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useFormatGroupedAllocationLabel() {
  const { t } = useTranslation()
  return useCallback(
    (
      count: number | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (count == null) return fallback
      return t('ui.groupallocationtail.othersCount', { count })
    },
    [t],
  )
}

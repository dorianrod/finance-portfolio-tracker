import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatPerformanceAsOfDate() {
  const { t } = useTranslation()
  const formatDate = useFormatDate()
  return useCallback(
    (
      date: Date | null | undefined,
      {
        fallback = t('ui.formatperformanceasofdateTs.notAvailable'),
      }: { fallback?: string } = {},
    ): string =>
      formatDate(date, {
        style: 'dayMonthYear',
        timeZone: 'UTC',
        fallback,
      }),
    [t, formatDate],
  )
}

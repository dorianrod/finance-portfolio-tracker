import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatPerformanceAsOfDate() {
  const formatDate = useFormatDate()
  return useCallback(
    (
      date: Date | null | undefined,
      {
        fallback = i18n.t('ui.formatperformanceasofdateTs.notAvailable'),
      }: { fallback?: string } = {},
    ): string =>
      formatDate(date, {
        style: 'dayMonthYear',
        timeZone: 'UTC',
        fallback,
      }),
    [formatDate],
  )
}

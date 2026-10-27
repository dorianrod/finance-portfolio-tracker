import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatPerformanceDateRange() {
  const formatDate = useFormatDate()
  return useCallback(
    (summary: { startDate: Date | null; endDate: Date | null }): string => {
      if (!summary.startDate || !summary.endDate) return ''
      const options = { style: 'shortMonthYear', timeZone: 'UTC' } as const
      return i18n.t('ui.formatters.dateRange', {
        from: formatDate(summary.startDate, options),
        to: formatDate(summary.endDate, options),
      })
    },
    [formatDate],
  )
}

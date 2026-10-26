import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatPerformanceAsOfDate() {
  const formatDate = useFormatDate()
  return useCallback(
    (date: Date | undefined): string => {
      if (!date) return i18n.t('ui.formatperformanceasofdateTs.notAvailable')
      return formatDate(date, { style: 'dayMonthYear', timeZone: 'UTC' })
    },
    [formatDate],
  )
}

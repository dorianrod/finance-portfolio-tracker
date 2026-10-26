import { useCallback } from 'react'

import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatPerformanceDateRange() {
  const formatDate = useFormatDate()
  return useCallback(
    (summary: { startDate: Date | null; endDate: Date | null }): string => {
      if (!summary.startDate || !summary.endDate) return ''
      const options = { style: 'shortMonthYear', timeZone: 'UTC' } as const
      return `${formatDate(summary.startDate, options)} – ${formatDate(summary.endDate, options)}`
    },
    [formatDate],
  )
}

import { useCallback } from 'react'

import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatMonthRange() {
  const formatDate = useFormatDate()
  return useCallback(
    (months: string[]): string => {
      if (months.length === 0) return ''
      const formatMonth = (month: string) =>
        formatDate(`${month}-01T00:00:00Z`, { style: 'shortMonthYear' })
      if (months.length === 1) return formatMonth(months[0])
      return `${formatMonth(months[0])} – ${formatMonth(months[months.length - 1])}`
    },
    [formatDate],
  )
}

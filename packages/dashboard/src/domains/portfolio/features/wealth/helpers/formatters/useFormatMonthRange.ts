import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatMonthRange() {
  const { t } = useTranslation()
  const formatDate = useFormatDate()
  return useCallback(
    (
      months: string[] | null | undefined,
      { fallback = '' }: { fallback?: string } = {},
    ): string => {
      if (months == null || months.length === 0) return fallback
      const formatMonth = (month: string) =>
        formatDate(`${month}-01T00:00:00Z`, { style: 'shortMonthYear' })
      if (months.length === 1) return formatMonth(months[0])
      return t('ui.formatters.dateRange', {
        from: formatMonth(months[0]),
        to: formatMonth(months[months.length - 1]),
      })
    },
    [t, formatDate],
  )
}

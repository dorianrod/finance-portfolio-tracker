import { useCallback } from 'react'

import i18n from '@/i18n/i18n'

import { useFormatPerformanceAsOfDate } from './useFormatPerformanceAsOfDate'

export function useFormatExactPerformanceDateRange() {
  const formatPerformanceAsOfDate = useFormatPerformanceAsOfDate()
  return useCallback(
    (summary: { startDate: Date | null; endDate: Date | null }): string => {
      if (!summary.startDate || !summary.endDate)
        return i18n.t('ui.formatexactperformancedaterangeTs.notAvailable')
      return `${formatPerformanceAsOfDate(summary.startDate)} – ${formatPerformanceAsOfDate(summary.endDate)}`
    },
    [formatPerformanceAsOfDate],
  )
}

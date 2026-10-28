import { useCallback } from 'react'

import type { PerformanceContributionSummary } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'
import i18n from '@/i18n/i18n'

import { useFormatPerformanceAsOfDate } from './useFormatPerformanceAsOfDate'

export function useFormatExactPerformanceDateRange() {
  const formatPerformanceAsOfDate = useFormatPerformanceAsOfDate()
  return useCallback(
    (
      summary:
        | Pick<PerformanceContributionSummary, 'startDate' | 'endDate'>
        | null
        | undefined,
      {
        fallback = i18n.t('ui.formatexactperformancedaterangeTs.notAvailable'),
      }: { fallback?: string } = {},
    ): string => {
      if (!summary?.startDate || !summary.endDate) return fallback
      return i18n.t('ui.formatters.dateRange', {
        from: formatPerformanceAsOfDate(summary.startDate),
        to: formatPerformanceAsOfDate(summary.endDate),
      })
    },
    [formatPerformanceAsOfDate],
  )
}

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { PerformanceContributionSummary } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'

import { useFormatPerformanceAsOfDate } from './useFormatPerformanceAsOfDate'

export function useFormatExactPerformanceDateRange() {
  const { t } = useTranslation()
  const formatPerformanceAsOfDate = useFormatPerformanceAsOfDate()
  return useCallback(
    (
      summary:
        | Pick<PerformanceContributionSummary, 'startDate' | 'endDate'>
        | null
        | undefined,
      {
        fallback = t('ui.formatexactperformancedaterangeTs.notAvailable'),
      }: { fallback?: string } = {},
    ): string => {
      if (!summary?.startDate || !summary.endDate) return fallback
      return t('ui.formatters.dateRange', {
        from: formatPerformanceAsOfDate(summary.startDate),
        to: formatPerformanceAsOfDate(summary.endDate),
      })
    },
    [t, formatPerformanceAsOfDate],
  )
}

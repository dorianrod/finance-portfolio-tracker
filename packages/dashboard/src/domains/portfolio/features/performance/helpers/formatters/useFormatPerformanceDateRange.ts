import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { PerformanceContributionSummary } from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatPerformanceDateRange() {
  const { t } = useTranslation()
  const formatDate = useFormatDate()
  return useCallback(
    (
      summary:
        | Pick<PerformanceContributionSummary, 'startDate' | 'endDate'>
        | null
        | undefined,
      { fallback = '' }: { fallback?: string } = {},
    ): string => {
      if (!summary?.startDate || !summary.endDate) return fallback
      const options = { style: 'shortMonthYear', timeZone: 'UTC' } as const
      return t('ui.formatters.dateRange', {
        from: formatDate(summary.startDate, options),
        to: formatDate(summary.endDate, options),
      })
    },
    [t, formatDate],
  )
}

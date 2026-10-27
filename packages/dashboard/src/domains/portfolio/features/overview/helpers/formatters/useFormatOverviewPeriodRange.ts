import { useCallback } from 'react'

import type { OverviewPeriod } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatOverviewPeriodRange() {
  const formatDate = useFormatDate()
  return useCallback(
    (
      period: OverviewPeriod | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (period == null) return fallback
      const options = { style: 'dayMonthYear', timeZone: 'UTC' } as const
      return i18n.t('ui.formatters.dateRange', {
        from: formatDate(period.start, options),
        to: formatDate(period.end, options),
      })
    },
    [formatDate],
  )
}

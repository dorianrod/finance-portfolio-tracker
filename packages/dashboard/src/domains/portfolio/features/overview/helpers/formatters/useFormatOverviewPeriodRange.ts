import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { OverviewPeriod } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatOverviewPeriodRange() {
  const { t } = useTranslation()
  const formatDate = useFormatDate()
  return useCallback(
    (
      period: OverviewPeriod | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (period == null) return fallback
      const options = { style: 'dayMonthYear', timeZone: 'UTC' } as const
      return t('ui.formatters.dateRange', {
        from: formatDate(period.start, options),
        to: formatDate(period.end, options),
      })
    },
    [t, formatDate],
  )
}

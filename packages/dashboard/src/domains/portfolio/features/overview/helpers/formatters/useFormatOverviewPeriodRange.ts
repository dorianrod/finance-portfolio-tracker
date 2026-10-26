import { useCallback } from 'react'

import type { OverviewPeriod } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'

export function useFormatOverviewPeriodRange() {
  const formatDate = useFormatDate()
  return useCallback(
    (period: OverviewPeriod): string => {
      const options = { style: 'dayMonthYear', timeZone: 'UTC' } as const
      return `${formatDate(period.start, options)} – ${formatDate(period.end, options)}`
    },
    [formatDate],
  )
}

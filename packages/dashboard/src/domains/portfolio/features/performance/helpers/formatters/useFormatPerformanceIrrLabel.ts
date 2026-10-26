import { useCallback } from 'react'

import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatPerformanceIrrLabel() {
  const formatPercentage = useFormatPercentage()
  return useCallback(
    (value: number | null, status: IrrStatus): string => {
      if (status === 'loading')
        return i18n.t('ui.formatperformanceirrlabelTs.calculating')
      if (status === 'error')
        return i18n.t('ui.formatperformanceirrlabelTs.unavailable')
      return formatPercentage(value, {
        decimals: 2,
        signed: true,
        fallback: i18n.t('ui.formatperformanceirrlabelTs.notAvailable'),
      })
    },
    [formatPercentage],
  )
}

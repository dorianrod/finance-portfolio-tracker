import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import type { NumericDisplayOptions } from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatPerformanceIrrLabel() {
  const { t } = useTranslation()
  const formatPercentage = useFormatPercentage()
  return useCallback(
    (
      value: number | null | undefined,
      status: IrrStatus,
      options: NumericDisplayOptions = {},
    ): string => {
      if (status === 'loading')
        return t('ui.formatperformanceirrlabelTs.calculating')
      if (status === 'error')
        return t('ui.formatperformanceirrlabelTs.unavailable')
      return formatPercentage(value, {
        decimals: 2,
        signed: true,
        ...options,
        fallback:
          options.fallback ?? t('ui.formatperformanceirrlabelTs.notAvailable'),
      })
    },
    [t, formatPercentage],
  )
}

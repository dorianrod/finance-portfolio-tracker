import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import type { NumericDisplayOptions } from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatOverviewIrrValue() {
  const { t } = useTranslation()
  const formatPercentage = useFormatPercentage()
  return useCallback(
    (
      value: number | null | undefined,
      status: IrrStatus,
      options: NumericDisplayOptions = {},
    ): string => {
      if (status === 'loading')
        return t('ui.formatoverviewirrvalueTs.calculating')
      return formatPercentage(status === 'error' ? null : value, {
        decimals: 2,
        signed: true,
        ...options,
      })
    },
    [t, formatPercentage],
  )
}

import { useCallback } from 'react'

import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import type { NumericDisplayOptions } from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export function useFormatIrrKpiValue() {
  const formatPercentage = useFormatPercentage()
  return useCallback(
    (
      value: number | null | undefined,
      status: IrrStatus,
      options: NumericDisplayOptions = {},
    ): string => {
      if (status === 'loading')
        return i18n.t('ui.formatirrkpivalueTs.calculating')
      return formatPercentage(value, { decimals: 2, signed: true, ...options })
    },
    [formatPercentage],
  )
}

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type NumericDisplayOptions,
  resolveNumericDisplayValue,
} from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function useFormatPositionCount() {
  const { t } = useTranslation()
  const formatNumber = useFormatNumber()
  return useCallback(
    (
      value: number | null | undefined,
      options: NumericDisplayOptions = {},
    ): string => {
      const displayValue = resolveNumericDisplayValue(value, options)
      if (typeof displayValue === 'string') return displayValue
      const formatted = formatNumber(displayValue, { useGrouping: false })
      return t('ui.formatpositioncount.position', {
        count: displayValue,
        value: formatted,
      })
    },
    [t, formatNumber],
  )
}

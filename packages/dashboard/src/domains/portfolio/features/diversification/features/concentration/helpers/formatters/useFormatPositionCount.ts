import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import {
  type NumericDisplayOptions,
  resolveNumericDisplayValue,
} from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function useFormatPositionCount() {
  const formatNumber = useFormatNumber()
  return useCallback(
    (
      value: number | null | undefined,
      options: NumericDisplayOptions = {},
    ): string => {
      const displayValue = resolveNumericDisplayValue(value, options)
      if (typeof displayValue === 'string') return displayValue
      const formatted = formatNumber(displayValue, { useGrouping: false })
      return i18n.t('ui.formatpositioncount.position', {
        count: displayValue,
        value: formatted,
      })
    },
    [formatNumber],
  )
}

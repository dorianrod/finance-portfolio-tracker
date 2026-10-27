import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import {
  type NumericDisplayOptions,
  resolveNumericDisplayValue,
} from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function useFormatConcentrationDelta() {
  const formatNumber = useFormatNumber()
  return useCallback(
    (
      value: number | null | undefined,
      options: NumericDisplayOptions = {},
    ): string => {
      const displayValue = resolveNumericDisplayValue(value, {
        ...options,
        fallback:
          options.fallback ??
          i18n.t('ui.formatconcentrationdeltaTs.firstComparableObservation'),
      })
      if (typeof displayValue === 'string') return displayValue
      return i18n.t(
        'ui.formatconcentrationdeltaTs.value0Value1PositionsVsPreviousMonth',
        {
          value0: displayValue > 0 ? '+' : '',
          value1: formatNumber(displayValue, { maximumFractionDigits: 0 }),
        },
      )
    },
    [formatNumber],
  )
}

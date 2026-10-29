import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  type NumericDisplayOptions,
  resolveNumericDisplayValue,
} from '@/shared/helpers/formatters/resolveNumericDisplayValue'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function useFormatConcentrationDelta() {
  const { t } = useTranslation()
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
          t('ui.formatconcentrationdeltaTs.firstComparableObservation'),
      })
      if (typeof displayValue === 'string') return displayValue
      return t(
        'ui.formatconcentrationdeltaTs.value0Value1PositionsVsPreviousMonth',
        {
          value0: displayValue > 0 ? '+' : '',
          value1: formatNumber(displayValue, { maximumFractionDigits: 0 }),
        },
      )
    },
    [t, formatNumber],
  )
}

import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function useFormatConcentrationDelta() {
  const formatNumber = useFormatNumber()
  return useCallback(
    (value: number | null): string => {
      if (value == null)
        return i18n.t(
          'ui.formatconcentrationdeltaTs.firstComparableObservation',
        )
      return i18n.t(
        'ui.formatconcentrationdeltaTs.value0Value1PositionsVsPreviousMonth',
        {
          value0: value > 0 ? '+' : '',
          value1: formatNumber(value, { maximumFractionDigits: 0 }),
        },
      )
    },
    [formatNumber],
  )
}

import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'

export function useFormatPositionCount() {
  const formatNumber = useFormatNumber()
  return useCallback(
    (value: number | null): string => {
      const formatted = formatNumber(value, { useGrouping: false })
      if (value == null) return formatted
      return i18n.t('ui.formatpositioncount.position', {
        count: value,
        value: formatted,
      })
    },
    [formatNumber],
  )
}

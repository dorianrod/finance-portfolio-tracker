import { useCallback } from 'react'

import { resolveNumericDisplayValue } from '@/shared/helpers/formatters/resolveNumericDisplayValue'

export function useFormatPercentage() {
  return useCallback(
    (
      value: number | null | undefined,
      options: PercentageFormatOptions = {},
    ): string => {
      const { decimals = 1, unit = '%' } = options
      const displayValue = resolveNumericDisplayValue(value, options)
      if (typeof displayValue === 'string') return displayValue
      const safeValue = Number.isFinite(displayValue) ? displayValue : 0
      const sign = options.signed && safeValue >= 0 ? '+' : ''
      return `${sign}${safeValue.toFixed(decimals)}${unit}`
    },
    [],
  )
}

type PercentageFormatOptions = {
  decimals?: number
  fallback?: string | number
  signed?: boolean
  unit?: '%' | ' %' | ' pp' | ''
  zeroAsFallback?: boolean
}

import { useCallback } from 'react'

import { resolveNumericDisplayValue } from '@/shared/helpers/formatters/resolveNumericDisplayValue'

export function useFormatPercentage() {
  return useCallback(
    (
      value: number | null | undefined,
      options: PercentageFormatOptions = {},
    ): string => {
      const displayValue = resolveNumericDisplayValue(value, options)
      if (typeof displayValue === 'string') return displayValue
      return formatPercentageValue(displayValue, options)
    },
    [],
  )
}

type PercentageFormatOptions = {
  decimals?: number | 'auto'
  fallback?: string | number
  signed?: boolean
  suffix?: string
  unit?: '%' | ' %' | ' pp' | ''
  zeroAsFallback?: boolean
}

function formatPercentageValue(
  value: number,
  { decimals = 1, unit = '%', suffix = '', signed }: PercentageFormatOptions,
): string {
  const safeValue = Number.isFinite(value) ? value : 0
  const sign = signed && safeValue >= 0 ? '+' : ''
  const formatted =
    decimals === 'auto' ? String(safeValue) : safeValue.toFixed(decimals)
  return `${sign}${formatted}${unit}${suffix}`
}

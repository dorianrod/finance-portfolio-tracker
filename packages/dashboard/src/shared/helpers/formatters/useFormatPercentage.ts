import { useCallback } from 'react'

type PercentageFormatOptions = {
  decimals?: number
  fallback?: string | number
  signed?: boolean
  unit?: '%' | ' %' | ' pp' | ''
  zeroAsFallback?: boolean
}

export function useFormatPercentage() {
  return useCallback(
    (
      value: number | null | undefined,
      options: PercentageFormatOptions = {},
    ): string => {
      const {
        decimals = 1,
        fallback = '—',
        signed = false,
        unit = '%',
        zeroAsFallback = false,
      } = options
      const displayValue =
        value == null || (zeroAsFallback && value === 0) ? fallback : value
      if (typeof displayValue === 'string') return displayValue
      const safeValue = Number.isFinite(displayValue) ? displayValue : 0
      const sign = signed && safeValue >= 0 ? '+' : ''
      return `${sign}${safeValue.toFixed(decimals)}${unit}`
    },
    [],
  )
}

import { useCallback } from 'react'

type PercentageFormatOptions = {
  decimals?: number
  signed?: boolean
  unit?: '%' | ' %' | ' pp' | ''
}

export function useFormatPercentage() {
  return useCallback(
    (value: number, options: PercentageFormatOptions = {}): string => {
      const { decimals = 1, signed = false, unit = '%' } = options
      const safeValue = Number.isFinite(value) ? value : 0
      const sign = signed && safeValue >= 0 ? '+' : ''
      return `${sign}${safeValue.toFixed(decimals)}${unit}`
    },
    [],
  )
}

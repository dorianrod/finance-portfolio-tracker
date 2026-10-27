import { useCallback } from 'react'

import { resolveNumericDisplayValue } from '@/shared/helpers/formatters/resolveNumericDisplayValue'

export function useFormatNumber() {
  return useCallback(
    (
      value: number | null | undefined,
      options: NumberFormatOptions = {},
    ): string => {
      const { fallback, zeroAsFallback, ...numberOptions } = options
      const displayValue = resolveNumericDisplayValue(value, {
        fallback,
        zeroAsFallback,
      })
      if (typeof displayValue === 'string') return displayValue
      const formatter = formatterFor(numberOptions)
      return formatter.format(Number.isFinite(displayValue) ? displayValue : 0)
    },
    [],
  )
}

type NumberFormatOptions = {
  fallback?: string | number
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  signDisplay?: Intl.NumberFormatOptions['signDisplay']
  useGrouping?: boolean
  zeroAsFallback?: boolean
}

const DEFAULT_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB')
const INTEGER_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
})
const TWO_DECIMAL_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 2,
})
const SIGNED_TWO_DECIMAL_NUMBER_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: 'always',
})

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Known formatting profiles choose cached formatters before the single arbitrary-options fallback.
function formatterFor(options: NumberFormatOptions): Intl.NumberFormat {
  if (Object.keys(options).length === 0) return DEFAULT_NUMBER_FORMATTER
  if (options.maximumFractionDigits === 0 && Object.keys(options).length === 1)
    return INTEGER_NUMBER_FORMATTER
  if (options.maximumFractionDigits === 2 && Object.keys(options).length === 1)
    return TWO_DECIMAL_NUMBER_FORMATTER
  if (
    options.maximumFractionDigits === 2 &&
    options.minimumFractionDigits === 2 &&
    options.signDisplay === 'always' &&
    Object.keys(options).length === 3
  )
    return SIGNED_TWO_DECIMAL_NUMBER_FORMATTER
  return new Intl.NumberFormat('en-GB', options)
}

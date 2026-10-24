import { useCallback } from 'react'

type NumberFormatOptions = {
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  signDisplay?: Intl.NumberFormatOptions['signDisplay']
  useGrouping?: boolean
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

export function useFormatNumber() {
  return useCallback(
    (value: number, options: NumberFormatOptions = {}): string => {
      const formatter = formatterFor(options)
      return formatter.format(Number.isFinite(value) ? value : 0)
    },
    [],
  )
}

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

function formatterFor(options: NumberFormatOptions): Intl.NumberFormat {
  const entries = Object.entries(options)
  const cached = NUMBER_FORMAT_PROFILES.find(
    (profile) =>
      entries.length === Object.keys(profile.options).length &&
      entries.every(
        ([key, value]) => Reflect.get(profile.options, key) === value,
      ),
  )
  return cached?.formatter ?? new Intl.NumberFormat('en-GB', options)
}

const NUMBER_FORMAT_PROFILES = [
  { options: {}, formatter: DEFAULT_NUMBER_FORMATTER },
  {
    options: { maximumFractionDigits: 0 },
    formatter: INTEGER_NUMBER_FORMATTER,
  },
  {
    options: { maximumFractionDigits: 2 },
    formatter: TWO_DECIMAL_NUMBER_FORMATTER,
  },
  {
    options: {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      signDisplay: 'always',
    },
    formatter: SIGNED_TWO_DECIMAL_NUMBER_FORMATTER,
  },
]

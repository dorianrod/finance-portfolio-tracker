import { useCallback } from 'react'

import i18n from '@/i18n/i18n'
import { resolveNumericDisplayValue } from '@/shared/helpers/formatters/resolveNumericDisplayValue'

export function useFormatMoney() {
  return useCallback(
    (
      value: number | null | undefined,
      options: MoneyFormatOptions = {},
    ): string => {
      const displayValue = resolveNumericDisplayValue(value, options)
      if (typeof displayValue === 'string') return displayValue
      if (isStandardEuroFormat(options))
        return formatStandardEuro(displayValue, options.style ?? 'currency')
      return formatConfiguredMoney(displayValue, options)
    },
    [],
  )
}

type MoneyStyle = 'currency' | 'decimal' | 'compact' | 'full'

type MoneyFormatOptions = {
  currency?: string
  fallback?: string | number
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  style?: MoneyStyle
  zeroAsFallback?: boolean
}

const INTEGER_EUR_FORMATTER = new Intl.NumberFormat('en-GB', {
  currency: 'EUR',
  maximumFractionDigits: 0,
  style: 'currency',
})

const DECIMAL_EUR_FORMATTER = new Intl.NumberFormat('en-GB', {
  currency: 'EUR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: 'currency',
})

const FULL_EUR_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
})

function formatCompactEuro(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return i18n.t('ui.useformatmoney.millions', {
      value: (value / 1_000_000).toFixed(1),
    })
  if (Math.abs(value) >= 1_000)
    return i18n.t('ui.useformatmoney.thousands', {
      value: (value / 1_000).toFixed(0),
    })
  return i18n.t('ui.useformatmoney.euros', { value: Math.round(value) })
}

function formatFullEuro(value: number): string {
  return `${FULL_EUR_FORMATTER.format(value)} €`
}

function isStandardEuroFormat(options: MoneyFormatOptions): boolean {
  return (
    (options.currency ?? 'EUR') === 'EUR' &&
    options.maximumFractionDigits == null &&
    options.minimumFractionDigits == null
  )
}
function formatStandardEuro(value: number, style: MoneyStyle): string {
  if (style === 'compact') return formatCompactEuro(value)
  if (style === 'full') return formatFullEuro(value)
  return style === 'decimal'
    ? DECIMAL_EUR_FORMATTER.format(value)
    : INTEGER_EUR_FORMATTER.format(value)
}
function moneyPrecision(
  style: MoneyStyle,
  maximumFractionDigits?: number,
  minimumFractionDigits?: number,
) {
  const defaultDigits = style === 'decimal' ? 2 : 0
  const minimumDigits =
    minimumFractionDigits ??
    Math.min(defaultDigits, maximumFractionDigits ?? defaultDigits)
  const maximumDigits =
    maximumFractionDigits ?? Math.max(defaultDigits, minimumDigits)

  return { maximumDigits, minimumDigits }
}
function formatConfiguredMoney(
  displayValue: number,
  options: MoneyFormatOptions,
): string {
  const { currency = 'EUR', style = 'currency' } = options
  const { maximumDigits, minimumDigits } = moneyPrecision(
    style,
    options.maximumFractionDigits,
    options.minimumFractionDigits,
  )
  const isFullEuro = style === 'full' && currency === 'EUR'
  const formatter = new Intl.NumberFormat('en-GB', {
    currency,
    maximumFractionDigits: maximumDigits,
    minimumFractionDigits: minimumDigits,
    style: isFullEuro ? 'decimal' : 'currency',
  })
  return isFullEuro
    ? `${formatter.format(displayValue)} €`
    : formatter.format(displayValue)
}

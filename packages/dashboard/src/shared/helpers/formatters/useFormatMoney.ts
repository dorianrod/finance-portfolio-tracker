import { useCallback } from 'react'

import i18n from '@/i18n/i18n'

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

export function useFormatMoney() {
  return useCallback(
    (
      value: number | null | undefined,
      options: MoneyFormatOptions = {},
    ): string => {
      const {
        currency = 'EUR',
        fallback = '—',
        maximumFractionDigits,
        minimumFractionDigits,
        style = 'currency',
        zeroAsFallback = false,
      } = options
      const displayValue =
        value == null || (zeroAsFallback && value === 0) ? fallback : value
      if (typeof displayValue === 'string') return displayValue

      if (
        style === 'compact' &&
        currency === 'EUR' &&
        maximumFractionDigits == null &&
        minimumFractionDigits == null
      )
        return formatCompactEuro(displayValue)
      if (
        style === 'full' &&
        currency === 'EUR' &&
        maximumFractionDigits == null &&
        minimumFractionDigits == null
      )
        return formatFullEuro(displayValue)
      if (
        currency === 'EUR' &&
        maximumFractionDigits == null &&
        minimumFractionDigits == null
      ) {
        return style === 'decimal'
          ? DECIMAL_EUR_FORMATTER.format(displayValue)
          : INTEGER_EUR_FORMATTER.format(displayValue)
      }

      const defaultDigits = style === 'decimal' ? 2 : 0
      const minimumDigits =
        minimumFractionDigits ??
        Math.min(defaultDigits, maximumFractionDigits ?? defaultDigits)
      const maximumDigits =
        maximumFractionDigits ?? Math.max(defaultDigits, minimumDigits)
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
    },
    [],
  )
}

import { useCallback } from 'react'

import i18n from '@/i18n/i18n'

type MoneyStyle = 'currency' | 'decimal' | 'compact' | 'full'

type MoneyFormatOptions = {
  currency?: string
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  style?: MoneyStyle
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
    (value: number, options: MoneyFormatOptions = {}): string => {
      const {
        currency = 'EUR',
        maximumFractionDigits,
        minimumFractionDigits,
        style = 'currency',
      } = options

      if (
        style === 'compact' &&
        currency === 'EUR' &&
        maximumFractionDigits == null
      )
        return formatCompactEuro(value)
      if (
        style === 'full' &&
        currency === 'EUR' &&
        maximumFractionDigits == null
      )
        return formatFullEuro(value)
      if (
        currency === 'EUR' &&
        maximumFractionDigits == null &&
        minimumFractionDigits == null
      ) {
        return style === 'decimal'
          ? DECIMAL_EUR_FORMATTER.format(value)
          : INTEGER_EUR_FORMATTER.format(value)
      }

      const formatter = new Intl.NumberFormat('en-GB', {
        currency,
        maximumFractionDigits:
          maximumFractionDigits ?? (style === 'decimal' ? 2 : 0),
        minimumFractionDigits:
          minimumFractionDigits ?? (style === 'decimal' ? 2 : 0),
        style: 'currency',
      })
      return formatter.format(value)
    },
    [],
  )
}

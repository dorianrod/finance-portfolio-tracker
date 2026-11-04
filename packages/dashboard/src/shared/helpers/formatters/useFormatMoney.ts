import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { resolveNumericDisplayValue } from '@/shared/helpers/formatters/resolveNumericDisplayValue'

export function useFormatMoney() {
  const { t } = useTranslation()
  const formatCompactEuro = useCallback(
    (value: number): string => {
      if (Math.abs(value) >= 1_000_000)
        return t('ui.useformatmoney.millions', {
          value: (value / 1_000_000).toFixed(1),
        })
      if (Math.abs(value) >= 1_000)
        return t('ui.useformatmoney.thousands', {
          value: (value / 1_000).toFixed(0),
        })
      return t('ui.useformatmoney.euros', { value: Math.round(value) })
    },
    [t],
  )
  return useCallback(
    (
      value: number | null | undefined,
      options: MoneyFormatOptions = {},
    ): string => {
      const displayValue = resolveNumericDisplayValue(value, options)
      if (typeof displayValue === 'string') return displayValue
      let formatted: string
      if (isStandardEuroFormat(options)) {
        formatted =
          options.style === 'compact'
            ? formatCompactEuro(displayValue)
            : formatStandardEuro(displayValue, options.style ?? 'currency')
      } else {
        formatted = formatConfiguredMoney(displayValue, options)
      }
      return options.signed && displayValue > 0 ? `+${formatted}` : formatted
    },
    [formatCompactEuro],
  )
}

type MoneyStyle = 'currency' | 'decimal' | 'compact' | 'full'

type MoneyFormatOptions = {
  currency?: string
  fallback?: string | number
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  signed?: boolean
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

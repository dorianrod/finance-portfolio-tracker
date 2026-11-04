import { useCallback } from 'react'

export function useFormatDate() {
  return useCallback(
    (
      value: Date | number | string | null | undefined,
      options: DateFormatOptions = {},
    ): string => {
      const { style = 'dayMonthYear', fallback = '—' } = options
      if (value == null) return fallback
      const date = value instanceof Date ? value : new Date(value)
      if (Number.isNaN(date.getTime())) return fallback
      if (style === 'isoDate') return date.toISOString().slice(0, 10)
      return UTC_DATE_FORMATTERS[style].format(date)
    },
    [],
  )
}

type DateStyle =
  | 'isoDate'
  | 'dayMonthYear'
  | 'longDayMonthYear'
  | 'longMonthYear'
  | 'shortMonthYear'
  | 'shortMonthShortYear'

type DateFormatOptions = {
  fallback?: string
  style?: DateStyle
  timeZone?: 'UTC'
}

const UTC_DATE_FORMATTERS: Record<
  Exclude<DateStyle, 'isoDate'>,
  Intl.DateTimeFormat
> = {
  dayMonthYear: utcFormatter({
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
  longDayMonthYear: utcFormatter({
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  longMonthYear: utcFormatter({ month: 'long', year: 'numeric' }),
  shortMonthYear: utcFormatter({ month: 'short', year: 'numeric' }),
  shortMonthShortYear: utcFormatter({ month: 'short', year: '2-digit' }),
}

function utcFormatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' })
}

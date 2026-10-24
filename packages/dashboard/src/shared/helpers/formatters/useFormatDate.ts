import { useCallback } from 'react'

type DateStyle =
  | 'isoDate'
  | 'dayMonthYear'
  | 'longDayMonthYear'
  | 'longMonthYear'
  | 'shortMonthYear'
  | 'shortMonthShortYear'

const DATE_OPTIONS: Record<Exclude<DateStyle, 'isoDate'>, Intl.DateTimeFormatOptions> = {
  dayMonthYear: { day: 'numeric', month: 'short', year: 'numeric' },
  longDayMonthYear: { day: 'numeric', month: 'long', year: 'numeric' },
  longMonthYear: { month: 'long', year: 'numeric' },
  shortMonthYear: { month: 'short', year: 'numeric' },
  shortMonthShortYear: { month: 'short', year: '2-digit' },
}

type DateFormatOptions = {
  style?: DateStyle
  timeZone?: 'UTC'
}

const UTC_DATE_FORMATTERS = Object.fromEntries(
  Object.entries(DATE_OPTIONS).map(([style, options]) => [
    style,
    new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }),
  ]),
) as Record<Exclude<DateStyle, 'isoDate'>, Intl.DateTimeFormat>

export function useFormatDate() {
  return useCallback((value: Date | number | string, options: DateFormatOptions = {}): string => {
    const { style = 'dayMonthYear' } = options
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    if (style === 'isoDate') return date.toISOString().slice(0, 10)
    return UTC_DATE_FORMATTERS[style].format(date)
  }, [])
}
